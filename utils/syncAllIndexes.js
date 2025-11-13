const syncAllIndexes = async (models = []) => {
  for (const model of models) {
    try {
      await model.syncIndexes();
      console.log(`${model.modelName} indexes synced`);
    } catch (err) {
      console.error(`${model.modelName} index sync failed:`, err.message);
    }
  }
};

export default syncAllIndexes;
