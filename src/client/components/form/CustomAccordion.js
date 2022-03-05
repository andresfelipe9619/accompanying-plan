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
  color,
  classes,
  subtitle,
}) {
  return (
    <Accordion
      TransitionProps={{ unmountOnExit: true }}
      style={{ width: '100%', margin: 4 }}
    >
      <AccordionSummary
        color={color}
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
    backgroundColor: ({ color }) => color || 'inherit',
  },
})(MuiAccordionSummary);
