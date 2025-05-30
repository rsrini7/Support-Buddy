import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Tooltip,
  IconButton
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const API_URL = 'http://localhost:9000/api/chroma-collections';

const AdminChromaPage = () => {
  const theme = useTheme();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('Failed to fetch collections');
        const data = await res.json();
        let safeCollections = [];
        if (data && Array.isArray(data.collections)) {
          safeCollections = data.collections.map(col => {
            if (col.collection_name && Array.isArray(col.records)) {
              return col;
            } else if (col.name) {
              return {
                collection_name: col.name,
                records: [] 
              };
            }
            return null;
          }).filter(Boolean);
        }
        setCollections(safeCollections);
      } catch (err) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchCollections();
  }, []);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Box
      sx={{
        bgcolor: theme.palette.background.default,
        color: theme.palette.text.primary,
        minHeight: '100vh',
        p: { xs: 1, sm: 2, md: 3 }
      }}
    >
      <Typography variant="h4" gutterBottom sx={{ color: theme.palette.text.primary }}>
        View Index Data: Collections
      </Typography>
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && collections.length === 0 && (
        <Alert severity="info">No collections found.</Alert>
      )}
      {!loading && !error && collections.map((col) => (
        <Accordion key={col.collection_name} defaultCollapsed>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">
              {col.collection_name} ({col.records.length} records)
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {col.records.length === 0 ? (
              <Alert severity="info">No records in this collection.</Alert>
            ) : (
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Document</TableCell>
                      <TableCell>Metadata</TableCell>
                      {/* <TableCell>Embedding</TableCell> */}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {col.records.map((rec, idx) => (
                      <TableRow key={rec.id || idx}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Tooltip title="Copy ID">
                              <IconButton size="small" onClick={() => handleCopy(rec.id)}>
                                <ContentCopyIcon fontSize="inherit" />
                              </IconButton>
                            </Tooltip>
                            <Typography variant="body2" sx={{ ml: 1 }}>
                              {rec.id}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                            {rec.document}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {rec.metadata ? (
                            Object.entries(rec.metadata).map(([k, v]) => (
                              <Chip
                                key={k}
                                label={`${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`}
                                size="small"
                                sx={{ mr: 0.5, mb: 0.5 }}
                              />
                            ))
                          ) : (
                            <Chip label="No metadata" size="small" />
                          )}
                        </TableCell>
                        {/* <TableCell>
                          {rec.embedding ? (
                            <Typography variant="caption" color="text.secondary">
                              [{rec.embedding.slice(0, 3).join(', ')}...]
                            </Typography>
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              N/A
                            </Typography>
                          )}
                        </TableCell> */}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default AdminChromaPage;