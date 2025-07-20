import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import LockIcon from "@mui/icons-material/Lock";
import { normalizeUrl } from "./shared/services/urlService";
import type { LockedSite } from "./shared/types/lockedSite";

const STORAGE_KEY = "lockedSites";

const App: React.FC = () => {
  const [inputUrl, setInputUrl] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("5");
  const [lockedSites, setLockedSites] = useState<Record<string, LockedSite>>(
    {}
  );
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      setLockedSites(result[STORAGE_KEY] || {});
    });

    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAdd = () => {
    const normalized = normalizeUrl(inputUrl);
    if (!normalized) return;

    const durationMs = parseInt(durationMinutes, 10) * 60 * 1000;

    const newSite: LockedSite = {
      url: normalized,
      expiresAt: Date.now() + durationMs,
    };

    const updated = { ...lockedSites, [normalized]: newSite };
    chrome.storage.local.set({ [STORAGE_KEY]: updated }, () => {
      setLockedSites(updated);
      setInputUrl("");
    });
  };

  const handleDelete = (url: string) => {
    const updated = { ...lockedSites };
    delete updated[url];
    chrome.storage.local.set({ [STORAGE_KEY]: updated }, () => {
      setLockedSites(updated);
    });
  };

  useEffect(() => {
    const updated = { ...lockedSites };
    let changed = false;

    Object.entries(lockedSites).forEach(([url, { expiresAt }]) => {
      if (expiresAt <= now) {
        delete updated[url];
        changed = true;
      }
    });

    if (changed) {
      chrome.storage.local.set({ [STORAGE_KEY]: updated }, () => {
        setLockedSites(updated);
      });
    }
  }, [now, lockedSites]);

  return (
    <Box p={2} width={300}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        <LockIcon sx={{ verticalAlign: "middle", mr: 1 }} />
        Site Locker
      </Typography>

      <Box display="flex" flexDirection="column" gap={1} mb={2}>
        <TextField
          label="Enter website"
          variant="outlined"
          size="small"
          fullWidth
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
        />
        <TextField
          label="Duration (minutes)"
          variant="outlined"
          size="small"
          type="number"
          value={durationMinutes}
          onChange={(e) => setDurationMinutes(e.target.value)}
        />
        <Button variant="contained" onClick={handleAdd}>
          Add
        </Button>
      </Box>

      <List dense>
        {Object.values(lockedSites).map(({ url, expiresAt }) => {
          const secondsLeft = Math.max(0, Math.floor((expiresAt - now) / 1000));

          return (
            <ListItem
              key={url}
              secondaryAction={
                <IconButton edge="end" onClick={() => handleDelete(url)}>
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemText
                primary={url}
                secondary={`Locked for ${secondsLeft}s`}
              />
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};

export default App;
