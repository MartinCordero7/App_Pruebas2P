describe("Login", () => {

    beforeEach(() => {
        cy.visit("http://localhost:5173/login");
    });

    it("Muestra la pantalla de login", () => {

        cy.contains("Condominio Manager")
            .should("exist");

    });

    it("Permite iniciar sesión con credenciales válidas", () => {

        cy.get('[data-cy="username"]')
            .type("admin");

        cy.get('[data-cy="password"]')
            .type("admin123");

        cy.get('[data-cy="login-btn"]')
            .click();

        cy.url()
            .should("include", "/");

    });

    it("Muestra error con credenciales inválidas", () => {

        cy.get('[data-cy="username"]')
            .type("usuario_inexistente");

        cy.get('[data-cy="password"]')
            .type("contraseña_incorrecta");

        cy.get('[data-cy="login-btn"]')
            .click();

        cy.contains("Credenciales inválidas")
            .should("exist");

    });

    it("Permite iniciar sesión con usuario recién registrado", () => {

        const timestamp = Date.now();
        const newUser = `testuser${timestamp}`;
        const newPass = "password123";

        // Primero registrar el usuario
        cy.visit("http://localhost:5173/register");

        cy.get('[data-cy="register-username"]').type(newUser);
        cy.get('[data-cy="register-email"]').type(`${newUser}@test.com`);
        cy.get('[data-cy="register-firstName"]').type("Test");
        cy.get('[data-cy="register-lastName"]').type("User");
        cy.get('[data-cy="register-password"]').type(newPass);
        cy.get('[data-cy="register-confirmPassword"]').type(newPass);
        cy.get('[data-cy="register-submit"]').click();

        // Esperar redirección tras registro y luego ir al login
        cy.url().should("not.include", "/register");
        cy.visit("http://localhost:5173/login");

        // Ahora iniciar sesión con el usuario registrado
        cy.get('[data-cy="username"]').type(newUser);
        cy.get('[data-cy="password"]').type(newPass);
        cy.get('[data-cy="login-btn"]').click();

        cy.url().should("include", "/");

    });

    it("Tiene enlace para ir al registro", () => {

        cy.contains("Regístrate aquí")
            .should("have.attr", "href", "/register");

    });

});