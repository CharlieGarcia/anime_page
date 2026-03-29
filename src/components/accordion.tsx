import React, { CSSProperties } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Image from './image';

interface CustomAccordionProps {
  title: string;
  synopsis?: string;
  thumbnailUrl?: string;
}

const styles: Record<string, CSSProperties> = {
  accordion: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between'
  },
  image: {
    width: '25%',
    height: 'auto'
  },
  synopsis: {
    width: '73%'
  }
};

export default function CustomAccordion({
  title,
  synopsis,
  thumbnailUrl
}: CustomAccordionProps) {
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
          style={styles.accordion}>
          {thumbnailUrl && (
            <Image
              style={styles.image}
              src={thumbnailUrl}
              alt="some_alt_text"
            />
          )}
          {synopsis && (
            <Typography style={styles.synopsis}>{synopsis}</Typography>
          )}
        </AccordionDetails>
      </Accordion>
    </div>
  );
}
