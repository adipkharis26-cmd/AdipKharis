import { Composition } from "remotion";
import { KusakaWarung } from "./Video";
import { FPS, TOTAL_FRAMES } from "./lib/timeline";
import { Lineup, ModelSheet } from "./sheets/ModelSheet";

export const RemotionRoot: React.FC = () => (
  <>
    {/* YouTube 16:9 */}
    <Composition id="KusakaWarung" component={KusakaWarung} durationInFrames={TOTAL_FRAMES}
      fps={FPS} width={1920} height={1080} defaultProps={{ vertical: false }} />
    {/* YouTube Shorts / Reels 9:16 — same scene, camera re-framed */}
    <Composition id="KusakaWarungShorts" component={KusakaWarung} durationInFrames={TOTAL_FRAMES}
      fps={FPS} width={1080} height={1920} defaultProps={{ vertical: true }} />
    {/* Character bible — locked reference sheets (render as stills) */}
    <Composition id="ModelSheet-kusaka" component={ModelSheet} durationInFrames={1} fps={FPS} width={3200} height={2300} defaultProps={{ id: "kusaka" as const }} />
    <Composition id="ModelSheet-ujang" component={ModelSheet} durationInFrames={1} fps={FPS} width={3200} height={2300} defaultProps={{ id: "ujang" as const }} />
    <Composition id="Lineup" component={Lineup} durationInFrames={1} fps={FPS} width={2400} height={1300} />
  </>
);
