import express from 'express';
import cors from 'cors';
import { fleetRegistryRouter } from './fleet_registry_routes';
import { dispatchAnalyticsRouter } from './dispatch_analytics_routes';

const app = express();

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Expose routes cleanly to the frontend network
app.use('/api', fleetRegistryRouter);
app.use('/api', dispatchAnalyticsRouter);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 TransitOps Engine operational at http://localhost:${PORT}`);
});

export default app;
