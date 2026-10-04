/* MU Season 6 web module loader: preserve stable inventory first, then gameplay systems. */
document.write(
  '<script src="functional-inventory-core.js?v=monster-gates2"><\/script>'+
  '<script src="mu-game-data.js?v=monster-gates2"><\/script>'+
  '<script src="mu-class-system.js?v=monster-gates2"><\/script>'+
  '<script src="mu-world.js?v=monster-gates2"><\/script>'+
  '<script src="mu-skill-effects.js?v=monster-gates2"><\/script>'+
  '<script src="mu-combat.js?v=monster-gates2"><\/script>'+
  '<script src="mu-skill-system.js?v=monster-gates2"><\/script>'+
  '<script src="mu-skill-ui.js?v=monster-gates2"><\/script>'+
  '<script src="mu-monster-system.js?v=monster-gates2"><\/script>'
);
