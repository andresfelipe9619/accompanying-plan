import React, { useEffect, useState } from 'react';
import Accordion from '@material-ui/core/Accordion';
import { makeStyles } from '@material-ui/core/styles';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { Grid } from '@material-ui/core';
import FormItem from '../form/FormItem';
import API from '../../api';
import data from './data';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
}));

const CustomAccordion = ({ title, children }) => {
  const classes = useStyles();

  return (
    <Accordion TransitionProps={{ unmountOnExit: true }}>
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
};

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [professors, setProfessors] = useState(data);
  const [, setLines] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [proyecto, setProyecto] = useState(null);

  const fetchInstitutions = async () => {
    let response = [];
    try {
      setLoading(true);
      response = await API.getInstitutions();
      setInstitutions(response);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
    return response;
  };
  const fetchProfessors = async () => {
    try {
      setLoading(true);
      const response = await API.getProfessors();
      const insts = await fetchInstitutions();
      const profs = response.map(p => ({
        ...p,
        institutions: insts.filter(i => i.profesional === p.correo),
      }));
      setProfessors(profs);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLines = async () => {
    try {
      setLoading(true);
      const response = await API.getLines();
      setLines(response);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = event => {
    setProyecto(event.target.value);
  };

  useEffect(() => {
    fetchProfessors();
    // fetchLines();
  }, []);

  console.log('institutions', institutions);
  console.log('professors', professors);
  if (loading) return <div>Loading ...</div>;
  return (
    <Grid container spacing={2}>
      <FormItem
        item={{
          label: 'Proyecto',
          name: 'proyecto',
          form: { size: 4, type: 'select', dependency: 'proyecto' },
        }}
        touched={{}}
        errors={{}}
        values={{ proyecto }}
        dependencies={{
          proyecto: [
            { label: '1', value: 1 },
            { label: '2', value: 2 },
            { label: '3', value: 3 },
          ],
        }}
        isSubmitting={loading}
        handleChange={handleChange}
      />
      <Grid item md={12}>
        {professors.map(p => (
          <CustomAccordion key={p.correo} title={p.nombre}>
            {Array.isArray(p.institutions)
              ? p.institutions.map(i => (
                  <CustomAccordion key={i.nombre} title={i.nombre}>
                    {i.snies} - {i.ubicacion}
                  </CustomAccordion>
                ))
              : 'No Data'}
          </CustomAccordion>
        ))}
      </Grid>
    </Grid>
  );
}
