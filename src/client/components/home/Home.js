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
  const [institutions, setInstitutions] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedLines, setSelectedLines] = useState({});

  const getCurrentUser = async () => {
    const email = await API.getCurrentUser();
    return email;
  };

  const fetchInstitutions = async () => {
    const response = await API.getInstitutions();
    setInstitutions(response);
    return response;
  };

  const fetchLines = async () => {
    const response = await API.getLines();
    setLines(response);
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

  const handleChangeProject = event => {
    setSelectedProject(event.target.value);
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
        const [email, profes] = await Promise.all(promises);
        const profe = profes.find(p => p.correo === email);
        if (!profe) return null;
        setCurrentUser(profe);
        const defaultLines = profe.lineas.reduce(
          (acc, l) => ({ ...acc, [l]: true }),
          {}
        );
        if (Object.keys(defaultLines).length) {
          setSelectedLines(defaultLines);
        }
      } catch (error) {
        console.error('INIT ERROR: ', error);
      } finally {
        setLoading(false);
      }
      return null;
    })();
  }, []);

  if (loading) return <Loading />;
  console.log('institutions', institutions);
  console.log('professors', professors);
  console.log('currentUser', currentUser);
  console.log('lines', lines);
  if (!currentUser) return <NoAuthorized />;

  const rol = roles.find(r => r.nombre === currentUser.rol);
  if (!rol) return <NoAuthorized />;

  const projects = currentUser.lineas
    .map(linea => {
      const found = lines.find(l => +l.id === +linea);
      if (!found) return null;
      return found.proyecto;
    })
    .filter(notNull => !!notNull);
  console.log('projects', projects);
  const keys = Object.keys(selectedLines);
  const profesToShow = professors.filter(p =>
    p.lineas.some(l => keys.some(k => !!selectedLines[k] && k === l))
  );
  console.log('profesToShow', profesToShow);

  const projectDependencies = [...new Set(projects)].map(map2select);
  const noop = {};
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
        values={{ proyecto: selectedProject }}
        dependencies={{
          proyecto: projectDependencies,
        }}
        isSubmitting={loading}
        handleChange={handleChangeProject}
      />
      <Grid item md={8}>
        <FormGroup row>
          {(currentUser.lineas || []).map(l => (
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
      <Grid item md={12} container spacing={2}>
        {profesToShow.map(p => (
          <Grid item md={12} container spacing={2} key={p.correo}>
            <CustomAccordion title={p.nombre}>
              {Array.isArray(p.instituciones) ? (
                p.instituciones.map(i => (
                  <Grid
                    item
                    xs={12}
                    key={i.nombre}
                    md={p.instituciones.length === 1 ? 12 : 6}
                  >
                    <CustomAccordion title={i.nombre}>
                      {!i.folders.length ? (
                        <Empty />
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
                        <Empty />
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
                  </Grid>
                ))
              ) : (
                <Empty />
              )}
            </CustomAccordion>
          </Grid>
        ))}
      </Grid>
    </Grid>
  );
}
