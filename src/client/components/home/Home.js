import React, { useEffect, useState } from 'react';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
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

function CustomAccordion({ title, children }) {
  const classes = useStyles();
  return (
    <Accordion
      TransitionProps={{ unmountOnExit: true }}
      style={{ width: '100%', margin: 4 }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
        <Typography className={classes.heading}>{title}</Typography>
      </AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  );
}

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
  const [roles, setRoles] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedLines, setSelectedLines] = useState({});

  const getCurrentUser = async () => {
    const email = await API.getCurrentUser();
    return email;
  };

  const fetchInstitutions = async () => {
    const response = await API.getInstitutions();
    return response;
  };

  const fetchLines = async () => {
    const response = await API.getLines();
    setLines(response);
    return response;
  };

  const fetchRoles = async () => {
    const response = await API.getRoles();
    setRoles(response);
  };

  const fetchProfessors = async () => {
    const response = await API.getProfessors();
    const insts = await fetchInstitutions();
    const profs = response.map(p => ({
      ...p,
      lineas: p.linea.split(','),
      instituciones: insts.filter(i => i.profesional === p.correo),
    }));
    setProfessors(profs);
    return profs;
  };

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
        const promises = [
          getCurrentUser(),
          fetchProfessors(),
          fetchLines(),
          fetchRoles(),
        ];
        const [email, profes, linesResponse] = await Promise.all(promises);
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
  if (!currentUser) return <NoAuthorized />;

  const rol = roles.find(r => r.nombre === currentUser.rol);
  if (!rol) return <NoAuthorized />;

  console.log('projects', projects);

  const keys = Object.keys(selectedLines);
  const isAccompanyingProfe = r => r === 'Profesional de acompañamiento';
  const isLineSelected = l => keys.some(k => !!selectedLines[k] && +k === +l);
  const filterByLine = p =>
    isAccompanyingProfe(p.rol) && p.lineas.some(isLineSelected);

  const showOnlyCurrentUser = isAccompanyingProfe(rol.nombre);
  const profes2Show = showOnlyCurrentUser
    ? [currentUser]
    : professors.filter(filterByLine);
  console.log('profes2Show', profes2Show);
  const lines2show = (currentUser.lineas || []).filter(ul =>
    lines.some(l => +l.id === +ul && +selectedProject === +l.proyecto)
  );
  const projectDependencies = [...new Set(projects)].map(map2select);
  const noop = {};
  const disabled = loading || projectDependencies.length === 1;
  return (
    <Grid container spacing={2}>
      <Grid item md={6} component={Box} fontWeight="bold">
        Perfil {rol.nombre}
      </Grid>
      <Grid item md={6} component={Box} textAlign="right" fontWeight="bold">
        Usuario: {currentUser.nombre}
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
          <CustomAccordion title={p.nombre}>
            <Box
              width="100%"
              display="flex"
              flexGrow="1"
              flexDirection="column"
            >
              {Array.isArray(p.instituciones) ? (
                p.instituciones.map(i => (
                  <CustomAccordion title={i.nombre} key={i.nombre}>
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
