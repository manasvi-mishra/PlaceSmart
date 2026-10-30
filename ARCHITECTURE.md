# PlaceSmart architecture

```text
PlaceSmart/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── data/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   └── ...
├── backend/
│   └── server.js
└── README.md
```

The frontend currently works as a self-contained hackathon demo with local state and demo data. The Express API mirrors the main entities and provides a persistence/AI integration seam. MongoDB connection support is prepared but the prototype does not depend on MongoDB being installed.
