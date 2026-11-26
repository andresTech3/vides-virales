import React from 'react';
import type { FormatoViral } from '../esquemas/brief.schema';
import type { EscenaGuion } from '../esquemas/guion.schema';
import type { EstiloPreset } from '../estilos';

import { WhatIfRenderer } from './what-if';
import { StorytellingSplitRenderer } from './storytelling-split';
import { QuizTriviaRenderer } from './quiz-trivia';
import { TopRankingRenderer } from './top-ranking';
import { FakeChatRenderer } from './fake-chat';
import { MindblownFactsRenderer } from './mindblown-facts';
import { QuoteWisdomRenderer } from './quote-wisdom';

interface FormatProps {
  escena: EscenaGuion;
  estilo: EstiloPreset;
  frameEnEscena: number;
}

export const FORMAT_RENDERERS: Record<FormatoViral, React.FC<FormatProps>> = {
  what_if: WhatIfRenderer,
  storytelling_split: StorytellingSplitRenderer,
  quiz_trivia: QuizTriviaRenderer,
  top_ranking: TopRankingRenderer,
  fake_chat: FakeChatRenderer,
  mindblown_facts: MindblownFactsRenderer,
  quote_wisdom: QuoteWisdomRenderer,
};
