/* MU Season 6 web module loader: preserve stable inventory first, then gameplay systems. */
document.write(
  '<script src="functional-inventory-core.js?v=skill-controls1"><\/script>'+
  '<script src="mu-game-data.js?v=skill-controls1"><\/script>'+
  '<script src="mu-class-system.js?v=skill-controls1"><\/script>'+
  '<script src="mu-world.js?v=skill-controls1"><\/script>'+
  '<script src="mu-skill-effects.js?v=skill-controls1"><\/script>'+
  '<script src="mu-combat.js?v=skill-controls1"><\/script>'+
  '<script src="mu-skill-system.js?v=skill-controls1"><\/script>'+
  '<script src="mu-skill-ui.js?v=skill-controls1"><\/script>'+
  '<script src="mu-monster-system.js?v=skill-controls1"><\/script>'
);
