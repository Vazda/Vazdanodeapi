import Express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import http from 'http';
import cors from 'cors';
import passport from 'passport';
import serverConfig from './config';
import { DB } from './config/db';
import AuthService from './services/auth.service';
import { passportInit } from './services/passport.service';
import ReinitControllers from './controllers';
import userRoutes from './routes/user.routes';
import projectRoutes from './routes/project.routes';
import projectMembersRoutes from './routes/projectMembers.routes';
import taskRoutes from './routes/task.routes';
import widgetRoutes from './routes/widget.routes';

const app = new Express();

const init = async () => {
  app.use(cors());
  const server = http.createServer(app);
  app.use(bodyParser.json({ limit: '20mb' }));
  app.use(bodyParser.urlencoded({ limit: '20mb', extended: true }));
  app.use(compression());
  app.use(cookieParser());
  await DB.init();
  await AuthService.init();
  ReinitControllers();

  app.use(passport.initialize());
  app.use(passport.session());

  passportInit();
  app.enable('trust proxy');

  app.use('/api/v1/users', userRoutes);
  app.use('/api/v1/projects', projectRoutes);
  app.use('/api/v1/project-members', projectMembersRoutes);
  app.use('/api/v1/tasks', taskRoutes);
  app.use('/api/v1/widgets', widgetRoutes);
  app.use('/test', (req, res) => {
    return res.send({ message: 'Okay' })
  });

  // Main errorHandler
  app.use((err, req, res, next) => {
    // treat as 404
    if (err.message && (~err.message.indexOf('not found') || (~err.message.indexOf(
      'Cast to ObjectId failed')))) {
      return next();
    }

    //  if (config.environment === 'development') {
    console.error(err);
    //  }

    // error as json
    return res.status(err.status || 500)
      .json({
        error: err,
      });
  });

  // assume 404 since no middleware responded
  app.use((req, res, next) => {
    res.status(404)
      .json({
        url: req.originalUrl,
        error: 'Not found',
      });
  });


  app.use('/', (req, res) => res.status(200).send('Nermin Backend'));
  app.use((req, res) => res.status(200).send('Not found!'));
  
  server.listen(serverConfig.port, (error) => {
    if (!error) {
      console.log(`Nermin's Server is running on: ${serverConfig.port}!`);
    } else {
      console.error(error);
    }
  });
};

init();

export default app;
