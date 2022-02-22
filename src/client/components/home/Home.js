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
import useStyles from './styles';
import API from '../../api';
import FormItem from '../form/FormItem';
import CustomAccordion from '../form/CustomAccordion';

function NoAuthorized() {
  return <b>401 NOT AUTHORIZED</b>;
}

function Loading() {
  const classes = useStyles();
  return (
    <div className={classes.loading}>
      <CircularProgress />
      <b>Cargando Información ...</b>
    </div>
  );
}

function Empty() {
  return <b>No hay datos para mostrar</b>;
}

const map2select = p => ({
  label: p,
  value: p,
});

const ProjectFormItem = {
  label: 'Proyecto',
  name: 'proyecto',
  form: { size: 4, type: 'select', dependency: 'proyecto' },
};

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [professors, setProfessors] = useState([]);
  const [lines, setLines] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedLines, setSelectedLines] = useState({});
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

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const response = await API.getAccompanyingData();
        console.log('response', response);
        const [email, profes, linesResponse] = response;
        if (profes) {
          setProfessors(profes);
        }
        if (linesResponse) {
          setLines(linesResponse);
        }
        const profe = profes.find(p => p.correo === email);
        if (!profe) return null;
        setCurrentUser(profe);
        const profeProjects = profe.lineas
          .map(linea => {
            const found = linesResponse.find(l => +l.id === +linea);
            if (!found) return null;
            return found.proyecto;
          })
          .filter(notNull => !!notNull);
        setProjects(profeProjects);
        const [first] = profeProjects;
        setProjectAndLines(first, linesResponse);
      } catch (error) {
        console.error('INIT ERROR: ', error);
      } finally {
        setLoading(false);
      }
      return null;
    })();
  }, []);

  if (loading) return <Loading />;
  console.log('professors', professors);
  console.log('currentUser', currentUser);
  if (!currentUser || !currentUser.rol) return <NoAuthorized />;
  const { rol, lineas, nombre } = currentUser;
  console.log('projects', projects);

  const keys = Object.keys(selectedLines);
  const isAccompanyingProfe = r => r === 'Profesional de acompañamiento';
  const isLineSelected = l => keys.some(k => !!selectedLines[k] && +k === +l);
  const filterByLine = p =>
    isAccompanyingProfe(p.rol) && p.lineas.some(isLineSelected);

  const showOnlyCurrentUser = isAccompanyingProfe(rol);
  const profes2Show = showOnlyCurrentUser
    ? [currentUser]
    : professors.filter(filterByLine);
  console.log('profes2Show', profes2Show);
  const lines2show = (lineas || []).filter(ul =>
    lines.some(l => +l.id === +ul && +selectedProject === +l.proyecto)
  );
  const projectDependencies = [...new Set(projects)].map(map2select);
  const noop = {};
  const disabled = loading || projectDependencies.length === 1;
  return (
    <Grid container spacing={2}>
      <Grid item md={6} component={Box} fontWeight="bold">
        Perfil {rol}
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
      {profes2Show.map(p => (
        <Grid item md={12} container spacing={2} key={p.correo}>
          <CustomAccordion classes={classes} title={p.nombre}>
            <Box
              width="100%"
              display="flex"
              flexGrow="1"
              flexDirection="column"
            >
              {Array.isArray(p.instituciones) ? (
                p.instituciones.map(i => (
                  <CustomAccordion
                    classes={classes}
                    title={i.nombre}
                    key={i.nombre}
                  >
                    {!i.folders.length ? (
                      <Empty key={i.nombre} />
                    ) : (
                      <List
                        dense
                        subheader={
                          <ListSubheader
                            component="div"
                            id="folders-list-subheader"
                          >
                            Carpetas
                          </ListSubheader>
                        }
                      >
                        {(i.folders || []).map(f => (
                          <ListItem
                            key={f.url}
                            divider
                            button
                            onClick={handleListItemClick(f)}
                          >
                            <ListItemIcon>
                              <FolderIcon />
                            </ListItemIcon>
                            <ListItemText primary={f.name} />
                          </ListItem>
                        ))}
                      </List>
                    )}
                    {!i.files.length ? (
                      <Empty key={i.nombre} />
                    ) : (
                      <List
                        dense
                        subheader={
                          <ListSubheader
                            component="div"
                            id="files-list-subheader"
                          >
                            Archivos
                          </ListSubheader>
                        }
                      >
                        {(i.files || []).map(f => (
                          <ListItem
                            key={f.url}
                            divider
                            button
                            onClick={handleListItemClick(f)}
                          >
                            <ListItemText primary={f.name} />
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </CustomAccordion>
                ))
              ) : (
                <Empty />
              )}
            </Box>
          </CustomAccordion>
        </Grid>
      ))}
    </Grid>
  );
}
