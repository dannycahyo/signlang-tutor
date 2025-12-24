import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('tutor', 'routes/tutor.tsx')
] satisfies RouteConfig;
