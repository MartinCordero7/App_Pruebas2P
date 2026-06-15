// ***********************************************
// Comandos personalizados de Cypress
// ***********************************************

/**
 * Comando para iniciar sesión mediante la interfaz de usuario.
 * Visita /login, introduce las credenciales y espera la redirección al dashboard.
 * Esto garantiza que el AuthContext quede correctamente inicializado con
 * el usuario y token en localStorage del navegador.
 *
 * Uso: cy.login()  /  cy.login('otroUsuario', 'otraContrasena')
 */
Cypress.Commands.add('login', (username = 'admin', password = 'admin123') => {
  cy.visit('http://localhost:5173/login');
  cy.get('[data-cy="username"]').clear().type(username);
  cy.get('[data-cy="password"]').clear().type(password);
  cy.get('[data-cy="login-btn"]').click();
  // Esperar a que la redirección post-login ocurra
  cy.url().should('not.include', '/login');
});