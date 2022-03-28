import React, { useEffect, useState } from 'react';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import FolderIcon from '@material-ui/icons/Folder';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Switch from '@material-ui/core/Switch';
import { isNaN } from 'formik';
import useStyles from './styles';
import API from '../../api';
import FormItem from '../form/FormItem';
import CustomAccordion from '../form/CustomAccordion';

const PENDING_MINUTES_COLOR = '#dd7e6b';
const DEFAULT_INS_COLOR = 'rgb(85, 85, 85, 0.7)';

function NoAuthorized() {
  return <b>401 NOT AUTHORIZED</b>;
}

function Loading({ useClass = true }) {
  const classes = useStyles();
  return (
    <div className={useClass ? classes.loading : ''}>
      <CircularProgress />
      <b>Cargando Información ...</b>
    </div>
  );
}

function Empty() {
  return <b>No hay datos para mostrar</b>;
}

const hasPendingMinutes = i =>
  (i?.files || []).some(f => !isNaN(f.pendingMinutes) && f.pendingMinutes > 0);

const getAlertColor = (ins, isGrey) => {
  if (ins.some(hasPendingMinutes)) return PENDING_MINUTES_COLOR;
  return isGrey ? DEFAULT_INS_COLOR : 'inherit';
};

const map2select = p => ({
  label: p,
  value: p,
});

const isAccompanyingProfe = r => r.includes('Profesional de acompañamiento');
const isSuperAdmin = r => r.includes('Alta dirección');

const noop = {};

const ProjectFormItem = {
  label: 'Proyecto',
  name: 'proyecto',
  form: { size: 4, type: 'select', dependency: 'proyecto' },
};

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [professors, setProfessors] = useState([]);
  const [lines, setLines] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedLines, setSelectedLines] = useState({});
  const [appError, setAppError] = useState(null);
  const [viewIES, setViewIES] = useState(false);
  const [institutionsFolders, setInstitutionsFolders] = useState({});
  const classes = useStyles();

  const setProjectAndLines = (project, mlines) => {
    if (!project) return;
    setSelectedProject(project);
    const projectLines = mlines
      .filter(l => +l.proyecto === +project)
      .reduce((acc, l) => ({ ...acc, [l.id]: true }), {});
    console.log('projectLines', projectLines);
    setSelectedLines(projectLines);
  };

  const handleChangeProject = event => {
    const project = event.target.value;
    console.log('handleChangeProject', project);
    setProjectAndLines(project, lines);
  };

  const handleChangeLine = event => {
    setSelectedLines({
      ...selectedLines,
      [event.target.name]: event.target.checked,
    });
  };

  function handleListItemClick(item) {
    return () => {
      if (!item.url) return;
      window.open(item.url, '_blank');
    };
  }

  function handleViewIES(e) {
    setViewIES(e.target.checked);
  }

  function getProfe(email, profes) {
    const profe = profes.find(p => p.correo === email);
    return profe;
  }

  function handleProfessorInput(email) {
    return () => {
      setAppError(null);
      if (!email) return setAppError('Ingrese un Email valido');
      const found = getProfe(email, professors);
      if (!found) return setAppError('Usuario No Encontrado');
      return setCurrentUser(found);
    };
  }

  function fetchInstitutionsFolder(insts) {
    const promises = insts.map(async i => {
      try {
        setInstitutionsFolders(prev => ({
          ...prev,
          [i.nombre]: { loading: true },
        }));
        const data = await API.getInstitutionsFolder(i);
        setInstitutionsFolders(prev => ({
          ...prev,
          [i.nombre]: { data, loading: false },
        }));
      } catch (error) {
        setInstitutionsFolders(prev => ({
          ...prev,
          [i.nombre]: { loading: false },
        }));
      }
    });
    return Promise.all(promises);
  }

  useEffect(() => {
    (async () => {
      try {
        const response = await API.getAccompanyingData();
        console.log('response', response);
        const [email, profes, linesResponse, insts] = response;

        if (profes) setProfessors(profes);
        if (linesResponse) setLines(linesResponse);

        const profe = getProfe(email, profes);
        if (profe) setCurrentUser(profe);
        setLoading(false);
        await fetchInstitutionsFolder(insts);
      } catch (error) {
        setLoading(false);
        console.error('INIT ERROR: ', error);
      }
      return null;
    })();
  }, []);

  useEffect(() => {
    if (!currentUser || !(lines || []).length) return;
    const profeProjects = currentUser.lineas
      .map(linea => {
        const found = lines.find(l => +l.id === +linea);
        if (!found) return null;
        return found.proyecto;
      })
      .filter(notNull => !!notNull);
    setProjects(profeProjects);
    const [first] = profeProjects;
    setProjectAndLines(first, lines);
  }, [currentUser, lines]);

  if (loading) return <Loading />;
  console.log('currentUser', currentUser);
  if (!currentUser) {
    return (
      <ProfessorInput handleClick={handleProfessorInput} error={appError} />
    );
  }

  if (!currentUser.rol) return <NoAuthorized />;
  const { roles = [], lineas, nombre } = currentUser;
  const keys = Object.keys(selectedLines);

  const isLineSelected = l =>
    (keys || []).some(k => !!selectedLines[k] && +k === +l);
  const filterByLine = p =>
    isAccompanyingProfe(p.roles) && (p.lineas || []).some(isLineSelected);

  const multiRole = roles.length > 1;
  const showOnlyCurrentUser = !multiRole && isAccompanyingProfe(roles);
  const profes2Show = showOnlyCurrentUser
    ? [currentUser]
    : professors.filter(filterByLine);
  console.log('profes2Show', profes2Show);
  const lines2show = (lineas || []).filter(ul =>
    (lines || []).some(l => +l.id === +ul && +selectedProject === +l.proyecto)
  );
  const projectDependencies = [...new Set(projects)].map(map2select);
  const disabled = loading || projectDependencies.length === 1;
  const instituciones = profes2Show.map(p => p.instituciones).flatMap(f => f);
  const isAdmin = isSuperAdmin(roles);
  console.log('institutionsFolders', institutionsFolders);
  return (
    <Grid container spacing={2}>
      <Grid item md={6} component={Box} fontWeight="bold">
        Perfil {roles.join(', ')}
      </Grid>
      <Grid item md={6} component={Box} textAlign="right" fontWeight="bold">
        Usuario: {nombre}
      </Grid>
      <FormItem
        item={ProjectFormItem}
        touched={noop}
        errors={noop}
        isSubmitting={disabled}
        values={{ proyecto: selectedProject }}
        dependencies={{
          proyecto: projectDependencies,
        }}
        handleChange={handleChangeProject}
      />
      <Grid item md={8}>
        <FormGroup row>
          {lines2show.map(l => (
            <FormControlLabel
              key={l}
              control={
                <Checkbox
                  checked={selectedLines[l]}
                  onChange={handleChangeLine}
                  name={l}
                  color="primary"
                />
              }
              label={`Línea ${l}`}
            />
          ))}
        </FormGroup>
      </Grid>
      <Grid item container md={12} justifyContent="flex-end" spacing={0}>
        <FormControlLabel
          control={
            <Switch
              checked={viewIES}
              onChange={handleViewIES}
              name="viewIES"
              color="primary"
            />
          }
          label="Ver sólo IES"
        />
      </Grid>
      {viewIES &&
        (instituciones || []).map(i => {
          const instFolder = institutionsFolders[i.nombre] || {};
          const { data, loading: loadingInstitution } = instFolder;
          return (
            <Grid item md={12} container spacing={2} key={i.nombre}>
              <CustomAccordion
                classes={classes}
                title={i.nombre}
                loading={loadingInstitution}
                color={getAlertColor([data], true)}
                subtitle={i.nombreProfesional}
              >
                {loadingInstitution && <Loading useClass={false} />}
                {!!data && !loadingInstitution && (
                  <Box width="100%" display="flex" flexGrow="1">
                    <CustomList
                      data={data?.files}
                      label="Archivos"
                      handleClick={handleListItemClick}
                    />
                    <CustomList
                      data={data?.folders}
                      label="Carpetas"
                      icon={FolderIcon}
                      handleClick={handleListItemClick}
                    />
                  </Box>
                )}
              </CustomAccordion>
            </Grid>
          );
        })}
      {!viewIES &&
        profes2Show.map(profe => {
          const isArray = Array.isArray(profe.instituciones);
          const hasInstitutions = isArray && !!profe.instituciones.length;
          if (!hasInstitutions) return null;
          const profeFolders = Object.entries(institutionsFolders).reduce(
            (acc, e) => {
              const [key, value] = e;
              const found = profe.instituciones.find(i => i.nombre === key);
              if (found && value?.data) return [...acc, value.data];

              return acc;
            },
            []
          );
          return (
            <Grid item md={12} container spacing={2} key={profe.correo}>
              <CustomAccordion
                classes={classes}
                title={profe.nombre}
                color={getAlertColor(profeFolders)}
              >
                <Box
                  width="100%"
                  display="flex"
                  flexGrow="1"
                  flexDirection="column"
                >
                  {profe.instituciones.map(i => {
                    const instFolder = institutionsFolders[i.nombre] || {};
                    const { data, loading: loadingInstitution } = instFolder;
                    return (
                      <CustomAccordion
                        loading={loadingInstitution}
                        color={getAlertColor([data], true)}
                        classes={classes}
                        title={i.nombre}
                        key={i.nombre}
                      >
                        {loadingInstitution && <Loading useClass={false} />}
                        {!!data && !loadingInstitution && (
                          <Box width="100%" display="flex" flexGrow="1">
                            <CustomList
                              data={data.files}
                              label="Archivos"
                              handleClick={handleListItemClick}
                            />
                            <CustomList
                              data={data.folders}
                              label="Carpetas"
                              icon={FolderIcon}
                              handleClick={handleListItemClick}
                            />
                          </Box>
                        )}
                      </CustomAccordion>
                    );
                  })}
                </Box>
              </CustomAccordion>
            </Grid>
          );
        })}
      {isAdmin && (
        <Box
          p={3}
          mt={5}
          display="flex"
          justifyContent="center"
          alignItems="center"
          width="100%"
        >
          <Button
            color="primary"
            variant="outlined"
            onClick={() => {
              const link =
                'https://docs.google.com/spreadsheets/d/16bA7IH13vTZp0uyl3yqXmSMHWmG80x_Td-MT6PFyXg0/edit#gid=0';

              return window.open(link, '_blank');
            }}
          >
            Indice Entregables MEN
          </Button>
        </Box>
      )}
    </Grid>
  );
}

function ProfessorInput({ error, handleClick }) {
  const [email, setEmail] = useState('');

  const handleChange = e => {
    const { value } = e.target;
    setEmail(value);
  };

  return (
    <Grid container spacing={2} component={Box} m={2} p={2} alignItems="center">
      <Grid item md={9}>
        <TextField
          value={email}
          label="Email"
          type="email"
          fullWidth
          id="email-search"
          variant="outlined"
          error={!!error}
          helperText={error}
          onChange={handleChange}
        />
      </Grid>
      <Grid item md={3}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleClick(email)}
        >
          Entrar
        </Button>
      </Grid>
    </Grid>
  );
}

const sortAlphabetically = (a, b) => a.name.localeCompare(b.name);

function CustomList({ label, data, handleClick, icon: Icon }) {
  if (!Array.isArray(data) || !data.length) return <Empty />;
  return (
    <List
      dense
      subheader={
        <ListSubheader
          component="div"
          id={`${label.toLowerCase()}-list-subheader`}
        >
          {label}
        </ListSubheader>
      }
    >
      {data.sort(sortAlphabetically).map(f => (
        <ListItem key={f.url} divider button onClick={handleClick(f)}>
          {Icon && (
            <ListItemIcon>
              <Icon />
            </ListItemIcon>
          )}
          <ListItemText primary={f.name} />
        </ListItem>
      ))}
    </List>
  );
}
