describe("Proveedores", () => {

    beforeEach(() => {
        cy.login();
        cy.visit("http://localhost:5173/suppliers");
    });

    // ────────────────────────────────────────────
    //  PRUEBAS DE APROBACIÓN
    // ────────────────────────────────────────────

    it("[APROBACIÓN] Muestra el título de la página", () => {

        cy.contains("Gestión de Proveedores")
            .should("exist");

    });

    it("[APROBACIÓN] Muestra el botón Nuevo Proveedor", () => {

        cy.contains("Nuevo Proveedor")
            .should("exist");

    });

    it("[APROBACIÓN] Muestra las pestañas Proveedores y Órdenes de Compra", () => {

        cy.contains("Proveedores").should("exist");
        cy.contains("Órdenes de Compra").should("exist");

    });

    it("[APROBACIÓN] Abre el formulario al hacer clic en Nuevo Proveedor", () => {

        cy.contains("Nuevo Proveedor").click();

        cy.get('input[name="name"]').should("exist");

    });

    it("[APROBACIÓN] Crea un proveedor exitosamente", () => {

        const ts = Date.now();

        cy.contains("Nuevo Proveedor").click();

        cy.get('input[name="name"]').type(`Proveedor Test ${ts}`);
        cy.get('input[name="email"]').type(`proveedor${ts}@test.com`);
        cy.get('input[name="phone"]').type("0991234567");
        cy.get('select[name="category"]').select("servicios");

        cy.contains("Guardar").click();

        cy.get('input[name="name"]')
            .should("not.exist");

    });

    it("[APROBACIÓN] Navega a la pestaña de Órdenes de Compra", () => {

        cy.contains("Órdenes de Compra").click();

        cy.contains("Órdenes de Compra")
            .should("exist");

    });

    it("[APROBACIÓN] Cierra el formulario con Cancelar", () => {

        cy.contains("Nuevo Proveedor").click();
        cy.contains("Cancelar").click();

        cy.get('input[name="name"]')
            .should("not.exist");

    });

    // ────────────────────────────────────────────
    //  PRUEBAS DE FALLO
    // ────────────────────────────────────────────

    it("[FALLO] Redirige al login si no hay sesión activa", () => {

        cy.clearLocalStorage();
        cy.visit("http://localhost:5173/suppliers");

        cy.url()
            .should("include", "/login");

    });

    it("[FALLO] Muestra error de validación si el nombre tiene menos de 3 caracteres", () => {

        cy.contains("Nuevo Proveedor").click();

        cy.get('input[name="name"]').type("AB"); // 2 chars — mínimo requerido: 3
        cy.get('select[name="category"]').select("servicios");

        cy.contains("Guardar").click();

        // La validación frontend bloquea el envío y muestra el error
        cy.contains("Mínimo 3 caracteres")
            .should("exist");

    });

    it("[FALLO] Muestra error de validación si el nombre está vacío", () => {

        cy.contains("Nuevo Proveedor").click();

        // Sin completar el campo nombre (requerido)
        cy.get('select[name="category"]').select("servicios");

        cy.contains("Guardar").click();

        // El mensaje de campo requerido aparece
        cy.contains("es requerido")
            .should("exist");

    });

});
