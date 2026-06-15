export async function searchFoodDataCentral(_query: string) {
  // To be implemented later with a secure backend/API route. Do not put API keys in the mobile app.
  return {
    message: "FoodData Central lookup will be connected later.",
  };
}

export async function lookupOpenFoodFactsBarcode(_barcode: string) {
  // To be implemented later with a secure backend/API route or public-safe client strategy.
  return {
    message: "Open Food Facts barcode lookup will be connected later.",
  };
}

export async function estimateFoodFromPhotoLater(_imageUri: string) {
  // To be implemented later with user approval and a secure AI backend. Photos are not uploaded in this step.
  return {
    message: "Food photo estimates will be connected later.",
  };
}
