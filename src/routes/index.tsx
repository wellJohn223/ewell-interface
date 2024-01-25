import { useRoutes } from 'react-router-dom';
// import { lazy } from 'react';
// const Example = lazy(() => import('pages/Example'));
// const Home = lazy(() => import('pages/Home'));
// const ProjectList = lazy(() => import('pages/ProjectList'));
// const ProjectInfo = lazy(() => import('pages/ProjectInfo'));
// const CreateProject = lazy(() => import('pages/CreateProject'));
// const EditInformation = lazy(() => import('pages/EditInformation'));
import Example from 'pages/Example';
import Home from 'pages/Home';
import ProjectList from 'pages/ProjectList';
import NewProjectInfo from 'pages/NewProjectInfo';
import ParticipantList from 'pages/ParticipantList';
import WhitelistUsers from 'pages/WhitelistUsers';
import CreateProject from 'pages/CreateProject';
import EditInformation from 'pages/EditInformation';

export const PageRouter = () =>
  useRoutes([
    {
      path: '/',
      element: <Home />,
    },
    {
      path: '/projects/:type',
      element: <ProjectList />,
    },
    {
      path: '/example',
      element: <Example />,
    },
    {
      path: '/project/:projectId',
      element: <NewProjectInfo />,
    },
    {
      path: '/participant-list/:projectId',
      element: <ParticipantList />,
    },
    {
      path: '/whitelist-users/:whitelistId',
      element: <WhitelistUsers />,
    },
    {
      path: '/create-project',
      element: <CreateProject />,
    },
    {
      path: '/edit-information/:projectId',
      element: <EditInformation />,
    },
    {
      path: '*',
      element: <Home />,
    },
  ]);
