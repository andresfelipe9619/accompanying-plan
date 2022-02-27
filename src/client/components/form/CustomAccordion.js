import React from 'react';
import Accordion from '@material-ui/core/Accordion';
import MuiAccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { withStyles } from '@material-ui/core/styles';

export default function CustomAccordion({
  title,
  children,
  classes,
  subtitle,
}) {
  return (
    <Accordion
      TransitionProps={{ unmountOnExit: true }}
      style={{ width: '100%', margin: 4 }}
    >
      <MuiAccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
        <Typography className={classes.heading}>{title}</Typography>
        {subtitle && (
          <Typography className={classes.secondaryHeading}>
            {subtitle}
          </Typography>
        )}
      </MuiAccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  );
}

export function GreyAccordion({ title, children, classes, subtitle }) {
  return (
    <Accordion
      elevation={0}
      TransitionProps={{ unmountOnExit: true }}
      style={{ width: '100%', margin: 4 }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
        <Typography className={classes.heading}>{title}</Typography>
        {subtitle && (
          <Typography className={classes.secondaryHeading}>
            {subtitle}
          </Typography>
        )}
      </AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  );
}

const AccordionSummary = withStyles({
  root: {
    backgroundColor: 'rgba(0, 0, 0, .03)',
  },
})(MuiAccordionSummary);
