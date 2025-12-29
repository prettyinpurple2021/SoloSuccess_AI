# Animation & Motion

**Version:** 3.0  
**Last Updated:** December 21, 2025

---

## Animation Timings

| Theme | Duration | Easing | Character |
|-------|----------|--------|-----------|
| Dark (Aggressive) | 200ms | ease-out | Fast, snappy, responsive |
| Light (Smooth) | 300ms | ease-out | Deliberate, polished, smooth |

---

## Easing Function

```
cubic-bezier(0.25, 0.46, 0.45, 0.94)
```

This creates natural deceleration that feels responsive yet polished.

---

## Common Animations

### Transitions

```
transition-all duration-200 ease-out (dark)
transition-all duration-300 ease-out (light)
```

### Hover Effects

```
hover:scale-105           - Slight scale up on hover
hover:shadow-glow-[color]-dark/light  - Glow effect
```

### Button Interactions

```
Dark:  scale-105 on hover, 200ms duration, sharp edges (rounded-none)
Light: scale-105 on hover, 300ms duration, rounded edges (rounded-sm)
```

### Loading States

- **Pulse**: Gentle opacity fade in/out
- **Shimmer**: Left-to-right gradient sweep
- **Flicker**: Rapid on/off effect
- **Bounce**: Vertical oscillation

---

## Glitch Effect (Dark Mode Only)

Applied to headings with `glitch={true}`:

```css
.dark .glitch-hover:hover::before {
  animation: glitch-dark-1 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
  color: #ff006e;
  clip-path: polygon(0 0, 100% 0, 100% 40%, 0 55%);
  text-shadow: -2px 0 #ff006e;
}

.dark .glitch-hover:hover::after {
  animation: glitch-dark-2 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite reverse;
  color: #39ff14;
  clip-path: polygon(0 55%, 100% 40%, 100% 100%, 0 100%);
  text-shadow: 2px 0 #39ff14;
}
```

---

## CSS Animations

```css
@keyframes glitch-dark-1 {
  0%, 100% { clip-path: polygon(0 0, 100% 0, 100% 40%, 0 55%); transform: translate(-2px, -2px); }
  50% { clip-path: polygon(0 55%, 100% 0, 100% 100%, 0 80%); transform: translate(2px, 2px); }
}

@keyframes glitch-dark-2 {
  0%, 100% { clip-path: polygon(0 55%, 100% 40%, 100% 100%, 0 100%); transform: translate(2px, 2px); }
  50% { clip-path: polygon(0 0, 100% 30%, 100% 60%, 0 80%); transform: translate(-2px, -2px); }
}

@keyframes glitch-light-1 {
  0%, 100% { clip-path: polygon(0 0, 100% 0, 100% 40%, 0 55%); transform: translate(-1px, -1px); }
  50% { clip-path: polygon(0 55%, 100% 0, 100% 100%, 0 80%); transform: translate(1px, 1px); }
}

@keyframes glitch-light-2 {
  0%, 100% { clip-path: polygon(0 55%, 100% 40%, 100% 100%, 0 100%); transform: translate(1px, 1px); }
  50% { clip-path: polygon(0 0, 100% 30%, 100% 60%, 0 80%); transform: translate(-1px, -1px); }
}
```

---

## Motion Rules

### ✅ DO:

- Use animations to provide feedback
- Keep animations fast (200-300ms)
- Use consistent easing across the app
- Apply theme-appropriate speeds

### ❌ DON'T:

- Animate for decoration only
- Use animations longer than 500ms
- Mix different easing functions
- Override theme speeds

---

**Back to [Design System Overview](README.md)**
