import { useCallback } from "react";

function Player({ x, y, color, username, isMe }) {
  const drawPlayer = useCallback(
    (g) => {
      g.clear();

      if (isMe) {
        g.circle(0, 0, 150);
        g.fill({ color: 0xffffff, alpha: 0.05 });
        g.stroke({ color: 0xffffff, alpha: 0.15, width: 1 });
      }

      g.circle(0, 0, 20);
      g.fill({ color: color });
      g.stroke({ color: 0xffffff, alpha: 0.5, width: 2 });
    },
    [color, isMe]
  );

  return (
    <pixiContainer x={x} y={y}>
      <pixiGraphics draw={drawPlayer} />
      <pixiText
        text={username}
        anchor={0.5}
        y={-35}
        style={{
          fontSize: 14,
          fill: isMe ? "#FFD700" : "#ffffff",
          fontFamily: "Arial",
        }}
      />
    </pixiContainer>
  );
}

export default Player;
