import { Composition } from "remotion";
import { KusakaWarung, KusakaWarungShorts, SHORTS_SKIP } from "./Video";
import { FPS, TOTAL_FRAMES } from "./lib/timeline";
import { Lineup, ModelSheet } from "./sheets/ModelSheet";
import { CHAR_IDS } from "./characters/Character";
import { LocationSheet, LocationStill } from "./sheets/LocationSheet";
import { LOCATIONS } from "./scene/Locations";

export const RemotionRoot: React.FC = () => (
  <>
    {/* YouTube 16:9 */}
    <Composition id="KusakaEpisode" component={KusakaWarung} durationInFrames={TOTAL_FRAMES}
      fps={FPS} width={1920} height={1080} defaultProps={{ vertical: false }} />
    {/* YouTube Shorts / Reels 9:16 — same scene, camera re-framed */}
    <Composition id="KusakaEpisodeShorts" component={KusakaWarungShorts} durationInFrames={TOTAL_FRAMES - SHORTS_SKIP}
      fps={FPS} width={1080} height={1920} />
    {/* Character bible — locked reference sheets (render as stills) */}
    {CHAR_IDS.map((id) => (
      <Composition key={id} id={`ModelSheet-${id}`} component={ModelSheet} durationInFrames={1} fps={FPS} width={3200} height={2760} defaultProps={{ id }} />
    ))}
    <Composition id="Lineup" component={Lineup} durationInFrames={1} fps={FPS} width={4000} height={2500} />
    {(Object.keys(LOCATIONS) as (keyof typeof LOCATIONS)[]).map((id) => (
      <Composition key={id} id={`Loc-${id}`} component={LocationStill} durationInFrames={1} fps={FPS} width={1920} height={1080} defaultProps={{ id }} />
    ))}
    <Composition id="LocationSheet" component={LocationSheet} durationInFrames={1} fps={FPS} width={4000} height={2080} />
  </>
);
