import React from 'react';
import {Composition} from 'remotion';
import {EP03} from './EP03';
import {EP03v2} from './EP03v2';
export const Root: React.FC = () => (<>
  <Composition id="EP03" component={EP03} durationInFrames={450} fps={30} width={1080} height={1920} />
  <Composition id="EP03v2" component={EP03v2} durationInFrames={405} fps={30} width={1080} height={1920} />
</>);
