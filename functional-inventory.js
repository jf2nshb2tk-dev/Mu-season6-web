/* MU Season 6 web module loader: preserve stable inventory first, then gameplay systems. */
document.write(
  '<script src="functional-inventory-core.js?v=bulk1"><\/script>'+ 
  '<script src="mu-game-data.js?v=bulk1"><\/script>'+ 
  '<script src="mu-class-system.js?v=bulk1"><\/script>'+ 
  '<script src="mu-combat.js?v=bulk1"><\/script>'+ 
  '<script src="mu-skill-system.js?v=bulk1"><\/script>'+ 
  '<script src="mu-skill-ui.js?v=bulk1"><\/script>'+ 
  '<script src="mu-monster-system.js?v=bulk1"><\/script>'
);
