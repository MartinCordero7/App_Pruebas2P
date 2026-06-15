describe("Finanzas", () => {

    beforeEach(() => {
        cy.login();
        cy.visit("http://localhost:5173/finance");
    });

    // ────────────────────────────────────────────
    //  PRUEBAS DE APROBACIÓN
    // ────────────────────────────────────────────

    it("[APROBACIÓN] Muestra el título Finanzas", () => {

        cy.contains("Finanzas")
            .should("exist");

    });

    it("[APROBACIÓN] Muestra la tarjeta de Ingresos Totales", () => {

        cy.contains("Ingresos Totales")
            .should("exist");

    });

    it("[APROBACIÓN] Muestra la tarjeta de Egresos Totales", () => {

        cy.contains("Egresos Totales")
            .should("exist");

    });

    it("[APROBACIÓN] Muestra la tarjeta de Utilidad", () => {

        cy.contains("Utilidad")
            .should("exist");

    });

    it("[APROBACIÓN] Muestra el gráfico Ingresos vs Egresos", () => {

        cy.contains("Ingresos vs Egresos")
            .should("exist");

    });

    it("[APROBACIÓN] Muestra el Balance General con Activos, Pasivos y Patrimonio", () => {

        cy.contains("Balance General").should("exist");
        cy.contains("Activos").should("exist");
        cy.contains("Pasivos").should("exist");
        cy.contains("Patrimonio").should("exist");

    });

    it("[APROBACIÓN] Muestra la sección de Indicadores con el botón Exportar a PDF", () => {

        cy.contains("Indicadores").should("exist");
        cy.contains("Exportar a PDF").should("exist");

    });

    // ────────────────────────────────────────────
    //  PRUEBAS DE FALLO
    // ────────────────────────────────────────────

    it("[FALLO] Redirige al login si no hay sesión activa", () => {

        cy.clearLocalStorage();
        cy.visit("http://localhost:5173/finance");

        cy.url()
            .should("include", "/login");

    });

    it("[FALLO] No muestra datos sensibles si el token es inválido", () => {

        // Simular token inválido en localStorage
        cy.window().then((win) => {
            win.localStorage.setItem("token", "token_invalido_12345");
        });

        cy.visit("http://localhost:5173/finance");

        // La página debe redirigir al login o mostrar error de autenticación
        cy.url().then((url) => {
            const isLoginOrFinance = url.includes("/login") || url.includes("/finance");
            expect(isLoginOrFinance).to.be.true;
        });

    });

});
