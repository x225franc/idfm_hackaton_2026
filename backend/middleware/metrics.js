const client = require('prom-client');

const registry = new client.Registry();

client.collectDefaultMetrics({ registry, prefix: 'idfm_' });

const httpRequestDuration = new client.Histogram({
  name: 'idfm_http_request_duration_seconds',
  help: 'Durée des requêtes HTTP en secondes',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
  registers: [registry],
});

const httpRequestsTotal = new client.Counter({
  name: 'idfm_http_requests_total',
  help: 'Nombre total de requêtes HTTP',
  labelNames: ['method', 'route', 'status_code'],
  registers: [registry],
});

const httpErrorsTotal = new client.Counter({
  name: 'idfm_http_errors_total',
  help: 'Nombre total de requêtes HTTP en erreur (4xx/5xx)',
  labelNames: ['method', 'route', 'status_code'],
  registers: [registry],
});

const metricsMiddleware = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;
    const labels = { method: req.method, route, status_code: res.statusCode };

    httpRequestDuration.observe(labels, duration);
    httpRequestsTotal.inc(labels);

    if (res.statusCode >= 400) {
      httpErrorsTotal.inc(labels);
    }
  });

  next();
};

const metricsHandler = async (_req, res) => {
  res.set('Content-Type', registry.contentType);
  res.end(await registry.metrics());
};

module.exports = { metricsMiddleware, metricsHandler };
