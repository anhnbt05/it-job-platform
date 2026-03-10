import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { NodeSDK } from '@opentelemetry/sdk-node';
import {
  BatchSpanProcessor,
  ParentBasedSampler,
  TraceIdRatioBasedSampler,
} from '@opentelemetry/sdk-trace-base';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';

const traceExporter = new OTLPTraceExporter({
  url: 'http://localhost:4318/v1/traces',
});

export const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'organization-service',
    [ATTR_SERVICE_VERSION]: '2.0.0',
  }),

  sampler: new ParentBasedSampler({
    root: new TraceIdRatioBasedSampler(1),
  }),

  spanProcessor: new BatchSpanProcessor(traceExporter),

  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': {
        enabled: false,
      },
      '@opentelemetry/instrumentation-dns': {
        enabled: false,
      },
      '@opentelemetry/instrumentation-net': {
        enabled: false,
      },
      '@opentelemetry/instrumentation-http': {
        ignoreIncomingRequestHook: (req) => {
          const url = req.url || '';
          return url.includes('/metrics') || url.includes('/health');
        },
      },
    }),
  ],
});

sdk.start();
