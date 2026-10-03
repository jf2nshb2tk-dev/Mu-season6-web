/* MU Season 6 web module loader: preserve stable inventory first, then gameplay systems. */
document.write(
  '<script src="functional-inventory-core.js?v=city-fx1"><\/script>'+
  '<script src="mu-game-data.js?v=city-fx1"><\/script>'+
  '<script src="mu-class-system.js?v=city-fx1"><\/script>'+
  '<script src="mu-world.js?v=city-fx1"><\/script>'+
  '<script src="mu-skill-effects.js?v=city-fx1"><\/script>'+
  '<script src="mu-combat.js?v=city-fx1"><\/script>'+
  '<script src="mu-skill-system.js?v=city-fx1"><\/script>'+
  '<script src="mu-skill-ui.js?v=city-fx1"><\/script>'+
  '<script src="mu-monster-system.js?v=city-fx1"><\/script>'
);
