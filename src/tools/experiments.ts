import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { ldRequest } from '../api.js';

interface Experiment {
  key: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'draft';
}

interface ExperimentResult {
  key: string;
  name: string;
  metrics: {
    name: string;
    value: number;
  }[];
}

export function registerExperimentTools(server: McpServer) {
  server.tool('listExperiments', 'List all experiments', {}, async (args, extra) => {
    try {
      const response = await ldRequest('/experiments');
      const experiments = (response as { items: Experiment[] }).items;
      return {
        content: [
          {
            type: 'text',
            text: `Found ${experiments.length} experiments in LaunchDarkly.`,
          },
          {
            type: 'text',
            text: JSON.stringify(experiments, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error listing experiments: ${error.message}`,
          },
        ],
      };
    }
  });

  server.tool('getExperimentDetails', 'Get details of a specific experiment', { key: z.string() }, async (args, extra) => {
    try {
      const experiment = await ldRequest(`/experiments/${args.key}`) as Experiment;
      return {
        content: [
          {
            type: 'text',
            text: `Details for experiment ${args.key}:`,
          },
          {
            type: 'text',
            text: JSON.stringify(experiment, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error getting experiment details for ${args.key}: ${error.message}`,
          },
        ],
      };
    }
  });

  server.tool('getExperimentResults', 'Get results of a specific experiment', { key: z.string() }, async (args, extra) => {
    try {
      const results = await ldRequest(`/experiments/${args.key}/results`) as ExperimentResult;
      return {
        content: [
          {
            type: 'text',
            text: `Results for experiment ${args.key}:`,
          },
          {
            type: 'text',
            text: JSON.stringify(results, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error getting experiment results for ${args.key}: ${error.message}`,
          },
        ],
      };
    }
  });

  server.tool('searchExperiments', 'Search for experiments', { query: z.string() }, async (args, extra) => {
    try {
      const response = await ldRequest('/experiments', 'GET', { q: args.query });
      const experiments = (response as { items: Experiment[] }).items;
      return {
        content: [
          {
            type: 'text',
            text: `Found ${experiments.length} experiments matching "${args.query}".`,
          },
          {
            type: 'text',
            text: JSON.stringify(experiments, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error searching experiments: ${error.message}`,
          },
        ],
      };
    }
  });
}