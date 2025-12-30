import { db } from '@/db'
import { paymentProviderConnections } from '@/db/schema'
import { eq, and, gte, lte, sql, inArray } from 'drizzle-orm'
import { logError, logInfo, logWarn } from '@/lib/logger'
import Stripe from 'stripe'

type PaymentConnection = typeof paymentProviderConnections.$inferSelect

export interface RevenueMetrics {
  mrr: number // Monthly Recurring Revenue
  totalRevenue: number // Total revenue for period
  revenueGrowth: number // Percentage growth
  revenueByPeriod: Array<{
    period: string
    revenue: number
    transactions: number
  }>
  subscriptions: {
    active: number
    canceled: number
    new: number
  }
  providers: string[] // List of active providers
  lastUpdated: Date
}

export class RevenueTrackingService {
  /**
    * Calculate MRR across all user's connected accounts
    */
  static async calculateMRR(userId: string): Promise<number> {
    try {
      const connections = await this.getActiveConnections(userId)
      let totalMRR = 0

      for (const connection of connections) {
        if (connection.provider === 'stripe') {
          totalMRR += await this.calculateStripeMRR(connection)
        } else if (connection.provider === 'paypal') {
          totalMRR += await this.calculatePayPalMRR(connection)
        }
        // Add more providers here as they are integrated
      }

      return Math.round(totalMRR * 100) / 100
    } catch (error) {
      logError('Error calculating aggregate MRR:', error)
      return 0
    }
  }

  /**
    * Calculate total revenue across all user's connected accounts
    */
  static async calculateRevenue(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    try {
      const connections = await this.getActiveConnections(userId)
      let totalRevenue = 0

      for (const connection of connections) {
        if (connection.provider === 'stripe') {
          totalRevenue += await this.calculateStripeRevenue(connection, startDate, endDate)
        } else if (connection.provider === 'paypal') {
          totalRevenue += await this.calculatePayPalRevenue(connection, startDate, endDate)
        }
      }

      return Math.round(totalRevenue * 100) / 100
    } catch (error) {
      logError('Error calculating aggregate revenue:', error)
      return 0
    }
  }

  /**
    * Stripe-specific MRR calculation
    */
  private static async calculateStripeMRR(connection: PaymentConnection): Promise<number> {
    if (!connection.access_token) return 0
    try {
      const stripe = new Stripe(connection.access_token, {
        apiVersion: '2025-02-24.acacia'
      })

      let mrr = 0
      let hasMore = true
      let startingAfter: string | undefined = undefined

      while (hasMore) {
        const subscriptions = await stripe.subscriptions.list({
          status: 'active',
          limit: 100,
          starting_after: startingAfter
        })

        for (const subscription of subscriptions.data) {
          for (const item of subscription.items.data) {
            const price = item.price
            if (price && price.recurring) {
              const quantity = item.quantity || 1
              const amount = ((price.unit_amount || 0) / 100) * quantity
              switch (price.recurring.interval) {
                case 'month': mrr += amount; break
                case 'year': mrr += amount / 12; break
                case 'week': mrr += amount * 4.33; break
                case 'day': mrr += amount * 30; break
              }
            }
          }
        }

        hasMore = subscriptions.has_more
        if (hasMore && subscriptions.data.length > 0) {
          startingAfter = subscriptions.data[subscriptions.data.length - 1].id
        }
      }

      return mrr
    } catch (error) {
      logError('Stripe MRR calculation failed:', error)
      return 0
    }
  }

  /**
    * Stripe-specific revenue calculation
    */
  private static async calculateStripeRevenue(connection: PaymentConnection, startDate: Date, endDate: Date): Promise<number> {
    if (!connection.access_token) return 0
    try {
      const stripe = new Stripe(connection.access_token, {
        apiVersion: '2025-02-24.acacia'
      })

      const charges = await stripe.charges.list({
        created: {
          gte: Math.floor(startDate.getTime() / 1000),
          lte: Math.floor(endDate.getTime() / 1000)
        },
        limit: 100
      })

      const countedPaymentIntentIds = new Set<string>()
      let total = 0

      for (const charge of charges.data) {
        if (charge.status === 'succeeded' && charge.paid) {
          total += charge.amount / 100
          if (charge.payment_intent && typeof charge.payment_intent === 'string') {
            countedPaymentIntentIds.add(charge.payment_intent)
          }
        }
      }

      // Check payment intents for direct payments without charges in list
      const paymentIntents = await stripe.paymentIntents.list({
        created: {
          gte: Math.floor(startDate.getTime() / 1000),
          lte: Math.floor(endDate.getTime() / 1000)
        },
        limit: 100
      })

      for (const pi of paymentIntents.data) {
        if (pi.status === 'succeeded' && pi.amount && !countedPaymentIntentIds.has(pi.id)) {
          total += pi.amount / 100
        }
      }

      return total
    } catch (error) {
      logError('Stripe Revenue calculation failed:', error)
      return 0
    }
  }

  /**
    * PayPal-specific MRR calculation (Placeholder for real API)
    */
  private static async calculatePayPalMRR(connection: PaymentConnection): Promise<number> {
    // PayPal Subscription API would be used here
    // requires paypal-rest-sdk or fetch calls to PayPal API
    // For now returning 0 as we only have Stripe SDK installed
    logWarn('PayPal MRR calculation not implemented', { connectionId: connection.id })
    return 0
  }

  /**
    * PayPal-specific revenue calculation (Placeholder for real API)
    */
  private static async calculatePayPalRevenue(connection: PaymentConnection, startDate: Date, endDate: Date): Promise<number> {
    // PayPal Orders/Transactions API would be used here
    logWarn('PayPal Revenue calculation not implemented', { connectionId: connection.id })
    return 0
  }

  /**
    * Get comprehensive revenue metrics for a user
    */
  static async getRevenueMetrics(
    userId: string,
    periodDays: number = 30
  ): Promise<RevenueMetrics> {
    try {
      const connections = await this.getActiveConnections(userId)
      if (connections.length === 0) {
        return {
          mrr: 0,
          totalRevenue: 0,
          revenueGrowth: 0,
          revenueByPeriod: [],
          subscriptions: { active: 0, canceled: 0, new: 0 },
          providers: [],
          lastUpdated: new Date()
        }
      }

      const now = new Date()
      const startDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000)
      const previousStartDate = new Date(startDate.getTime() - periodDays * 24 * 60 * 60 * 1000)

      const currentRevenue = await this.calculateRevenue(userId, startDate, now)
      const previousRevenue = await this.calculateRevenue(userId, previousStartDate, startDate)
      const mrr = await this.calculateMRR(userId)

      const revenueGrowth = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0

      // Aggregate subscriptions (simplified for now to active total)
      let activeCount = 0
      for (const conn of connections) {
        if (conn.provider === 'stripe' && conn.access_token) {
          const stripe = new Stripe(conn.access_token, { apiVersion: '2025-02-24.acacia' })
          const subs = await stripe.subscriptions.list({ status: 'active', limit: 100 })
          activeCount += subs.data.length
          // Note: In production, we should handle pagination here too
        }
      }

      // Update sync timestamps in batch
      const connectionIds = connections.map(c => c.id)
      if (connectionIds.length > 0) {
        await db.update(paymentProviderConnections)
          .set({ last_synced_at: new Date(), updated_at: new Date() })
          .where(inArray(paymentProviderConnections.id, connectionIds))
      }

      return {
        mrr,
        totalRevenue: currentRevenue,
        revenueGrowth: Math.round(revenueGrowth * 100) / 100,
        revenueByPeriod: [], // TODO: implement multi-provider period aggregation
        subscriptions: {
          active: activeCount,
          canceled: 0,
          new: 0
        },
        providers: connections.map(c => c.provider),
        lastUpdated: new Date()
      }
    } catch (error) {
      logError('Error getting aggregate revenue metrics:', error)
      return {
        mrr: 0,
        totalRevenue: 0,
        revenueGrowth: 0,
        revenueByPeriod: [],
        subscriptions: { active: 0, canceled: 0, new: 0 },
        providers: [],
        lastUpdated: new Date()
      }
    }
  }

  /**
    * Get all active payment connections for a user
    */
  private static async getActiveConnections(userId: string): Promise<PaymentConnection[]> {
    return await db
      .select()
      .from(paymentProviderConnections)
      .where(
        and(
          eq(paymentProviderConnections.user_id, userId),
          eq(paymentProviderConnections.is_active, true)
        )
      )
  }

  /**
    * Refresh provider access token if expired
    */
  static async refreshToken(userId: string, provider: string): Promise<boolean> {
    try {
      const connections = await db
        .select()
        .from(paymentProviderConnections)
        .where(
          and(
            eq(paymentProviderConnections.user_id, userId),
            eq(paymentProviderConnections.provider, provider),
            eq(paymentProviderConnections.is_active, true)
          )
        )
        .limit(1)

      if (connections.length === 0 || !connections[0].refresh_token) {
        return false
      }

      // Implement provider-specific refresh logic
      logWarn(`${provider} token refresh not implemented, user needs to reconnect`, { userId })
      return false
    } catch (error) {
      logError(`Error refreshing ${provider} token:`, error)
      return false
    }
  }
}
