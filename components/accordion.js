import React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Image from './image';

export default function CustomAccordion({ title, synopsis, thumbnailUrl }) {
  return (
    <div>
      <Accordion>
        <AccordionSummary
          expandIcon={<ArrowDropDownIcon />}
          aria-controls="panel2-content"
          id="panel2-header">
          <Typography component="span">{title}</Typography>
        </AccordionSummary>
        <AccordionDetails
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-between'
          }}>
          {thumbnailUrl && (
            <Image
              style={{ width: '25%', height: 'auto' }}
              src={thumbnailUrl}
              alt="some_alt_text"
            />
          )}
          {synopsis && (
            <Typography style={{ width: '73%' }}>{synopsis}</Typography>
          )}
        </AccordionDetails>
      </Accordion>
    </div>
  );
}
