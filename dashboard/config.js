// Matchplan-Konfiguration.
// Solange die Webhook-URLs leer sind, läuft die App im Demo-Modus mit Beispieldaten.
// Sobald die n8n-Workflows stehen, hier die Produktions-URLs eintragen, z. B.:
//   briefingUrl: 'https://aiva179.app.n8n.cloud/webhook/dashboard-briefing',
//   checkinUrl:  'https://aiva179.app.n8n.cloud/webhook/dashboard-reflexion',
window.MATCHPLAN_CONFIG = {
  name: 'Lenard',
  briefingUrl: '',
  checkinUrl: '',
  timezone: 'America/Los_Angeles',
};
