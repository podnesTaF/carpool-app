export interface Prediction {
  placePrediction: {
    place: string;
    placeId: string;
    text: {
      text: string;
      matches: Match[];
    };
    structuredFormat: {
      mainText: {
        text: string;
        matches: Match[];
      };
      secondaryText: {
        text: string;
      };
    };
    types: string[];
  };
}

interface Match {
  startOffset: number;
  endOffset: number;
}
