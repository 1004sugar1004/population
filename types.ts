
export interface PopulationDataItem {
  [key: string]: number;
}

export interface PopulationData {
  [year: string]: PopulationDataItem;
}

export interface SavedChart {
  year: string;
  data: PopulationDataItem;
}
