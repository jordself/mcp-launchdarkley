import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { ldRequest } from '../api.js';

interface Environment {
  key: string;
  name: string;
  color: string;
  _default: boolean;
}

interface EnvironmentsResponse {
  items?: Environment[];
}

export function registerEnvironmentTools(server: McpServer) {
  // Tool to list all environments in a project
  server.tool('listEnvironments', {
    projectKey: z.string().describe('The project key to list environments for'),
  }, async ({ projectKey }, extra) => {
    try {
      const environments = await ldRequest(`/projects/${projectKey}/environments`) as EnvironmentsResponse;
      const items = environments.items || [];
      return {
        content: [
          {
            type: 'text',
            text: `Found ${items.length} environments in project "${projectKey}".`,
          },
          {
            type: 'text',
            text: JSON.stringify(items.map((env: Environment) => ({
              key: env.key,
              name: env.name,
              color: env.color,
              default: env._default,
            })), null, 2),
          },
        ],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: 'text',
            text: `Error fetching environments for project "${projectKey}": ${errorMessage}`,
          },
        ],
      };
    }
  });
}
