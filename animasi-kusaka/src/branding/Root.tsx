import React from "react";
import { Composition } from "remotion";
import { Thumbnail, ThumbProps, thumbSize } from "./Thumbnail";
import { BannerPro, Logo } from "./Brand";
import { Intro, INTRO_SECONDS } from "./Intro";
import { INTRO_ALT_SECONDS, IntroB, IntroC } from "./IntroAlt";
import { INTRO_CINE_SECONDS, IntroD } from "./IntroCine";
import thumbs from "./thumbnails.json";
import brand from "./brand.json";

/* LOCKED brand assets (brand.json): official logo = Logo 2, official banner = Banner 3. */
export const BrandingRoot: React.FC = () => (
  <>
    <Composition id="Logo" component={Logo} durationInFrames={1} fps={30} width={800} height={800} defaultProps={{ variant: brand.logo.chosen as 2 }} />
    <Composition id="Banner" component={BannerPro} durationInFrames={1} fps={30} width={2560} height={1440} defaultProps={{ variant: brand.banner.chosen as 3 }} />
    <Composition id="BannerGuide" component={BannerPro} durationInFrames={1} fps={30} width={2560} height={1440} defaultProps={{ variant: brand.banner.chosen as 3, guide: true }} />
    <Composition id="Intro" component={Intro} durationInFrames={INTRO_SECONDS * 30} fps={30} width={1920} height={1080} />
    <Composition id="IntroB" component={IntroB} durationInFrames={INTRO_ALT_SECONDS * 30} fps={30} width={1920} height={1080} />
    <Composition id="IntroC" component={IntroC} durationInFrames={INTRO_ALT_SECONDS * 30} fps={30} width={1920} height={1080} />
    <Composition id="IntroD" component={IntroD} durationInFrames={INTRO_CINE_SECONDS * 30} fps={30} width={1920} height={1080} />
    {Object.entries(thumbs as Record<string, ThumbProps>).map(([id, p]) => (
      <Composition key={id} id={`Thumb-${id}`} component={Thumbnail as unknown as React.FC<Record<string, unknown>>} durationInFrames={1} fps={30} width={thumbSize(p).w} height={thumbSize(p).h} defaultProps={p as unknown as Record<string, unknown>} />
    ))}
  </>
);
