import { Composition } from "remotion";
import { KusakaWarung } from "./Video";
import { FPS, TOTAL_FRAMES } from "./lib/timeline";

export const RemotionRoot: React.FC = () => (
  <>
    {/* YouTube 16:9 */}
    <Composition id="KusakaWarung" component={KusakaWarung} durationInFrames={TOTAL_FRAMES}
      fps={FPS} width={1920} height={1080} defaultProps={{ vertical: false }} />
    {/* YouTube Shorts / Reels 9:16 — same scene, camera re-framed */}
    <Composition id="KusakaWarungShorts" component={KusakaWarung} durationInFrames={TOTAL_FRAMES}
      fps={FPS} width={1080} height={1920} defaultProps={{ vertical: true }} />
  </>
);
