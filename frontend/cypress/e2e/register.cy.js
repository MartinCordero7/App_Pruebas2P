describe("Register", () => {

    beforeEach(() => {
        cy.visit("http://localhost:5173/register");
    });

    it("Muestra la pantalla de registro", () => {

        cy.contains("Crear Cuenta")
            .should("exist");

    });

    it("Muestra todos los campos del formulario", () => {

        cy.get('[data-cy="register-username"]').should("exist");
        cy.get('[data-cy="register-email"]').should("exist");
        cy.get('[data-cy="register-firstName"]').should("exist");
        cy.get('[data-cy="register-lastName"]').should("exist");
        cy.get('[data-cy="register-password"]').should("exist");
        cy.get('[data-cy="register-confirmPassword"]').should("exist");
        cy.get('[data-cy="register-role"]').should("exist");
        cy.get('[data-cy="register-submit"]').should("exist");

    });

    it("Muestra error cuando las contraseñas no coinciden", () => {

        cy.get('[data-cy="register-username"]').type("usuarioprueba");
        cy.get('[data-cy="register-email"]').type("prueba@test.com");
        cy.get('[data-cy="register-password"]').type("password123");
        cy.get('[data-cy="register-confirmPassword"]').type("diferente456");
        cy.get('[data-cy="register-submit"]').click();

        cy.contains("Las contraseñas no coinciden")
            .should("exist");

    });

    it("Registra un nuevo usuario exitosamente", () => {

        const timestamp = Date.now();

        cy.get('[data-cy="register-username"]').type(`usuario${timestamp}`);
        cy.get('[data-cy="register-email"]').type(`usuario${timestamp}@test.com`);
        cy.get('[data-cy="register-firstName"]').type("Juan");
        cy.get('[data-cy="register-lastName"]').type("Pérez");
        cy.get('[data-cy="register-password"]').type("password123");
        cy.get('[data-cy="register-confirmPassword"]').type("password123");
        cy.get('[data-cy="register-role"]').select("resident");
        cy.get('[data-cy="register-submit"]').click();

        cy.url().should("not.include", "/register");

    });

    it("Muestra error al registrar un usuario ya existente", () => {

        cy.get('[data-cy="register-username"]').type("admin");
        cy.get('[data-cy="register-email"]').type("admin@condominio.local");
        cy.get('[data-cy="register-password"]').type("admin123");
        cy.get('[data-cy="register-confirmPassword"]').type("admin123");
        cy.get('[data-cy="register-submit"]').click();

        cy.contains("ya existe")
            .should("exist");

    });

    it("Tiene enlace para ir al login", () => {

        cy.contains("Inicia sesión")
            .should("have.attr", "href", "/login");

    });

});
