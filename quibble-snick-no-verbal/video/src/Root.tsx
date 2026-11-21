import React from 'react';
import {Composition} from 'remotion';
import {EP03v2} from './EP03v2';
import {EP01} from './EP01';
import {EP02} from './EP02';
import {EP04, CastSheet} from './EP04';
import {EP05} from './EP05';
import {EP06} from './EP06';
import {EP07} from './EP07';
import {EP08} from './EP08';
import {EP09} from './EP09';
import {EP10} from './EP10';
import {EP11} from './EP11';
export const Root: React.FC = () => (<>
  <Composition id="EP03v2" component={EP03v2} durationInFrames={405} fps={30} width={1080} height={1920} />
  <Composition id="EP01" component={EP01} durationInFrames={420} fps={30} width={1080} height={1920} />
  <Composition id="EP02" component={EP02} durationInFrames={420} fps={30} width={1080} height={1920} />
  <Composition id="EP04" component={EP04} durationInFrames={420} fps={30} width={1080} height={1920} />
  <Composition id="EP05" component={EP05} durationInFrames={420} fps={30} width={1080} height={1920} />
  <Composition id="EP06" component={EP06} durationInFrames={420} fps={30} width={1080} height={1920} />
  <Composition id="EP07" component={EP07} durationInFrames={420} fps={30} width={1080} height={1920} />
  <Composition id="EP08" component={EP08} durationInFrames={420} fps={30} width={1080} height={1920} />
  <Composition id="EP09" component={EP09} durationInFrames={420} fps={30} width={1080} height={1920} />
  <Composition id="EP10" component={EP10} durationInFrames={420} fps={30} width={1080} height={1920} />
  <Composition id="EP11" component={EP11} durationInFrames={420} fps={30} width={1080} height={1920} />
  <Composition id="CastSheet" component={CastSheet} durationInFrames={1} fps={30} width={2160} height={960} />
</>);
