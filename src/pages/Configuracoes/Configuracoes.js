import { apiRequest } from "../../services/api.js";

const Configuracoes = {
  render() {
    return `
      <section class="configuracoes-page">

        <div class="configuracoes-hero">
          <div class="configuracoes-hero-overlay"></div>

          <div class="configuracoes-hero-content">
            <span class="configuracoes-hero-label">PAINEL DE COMUNICAÇÃO</span>
            <h1>Configurações</h1>
            <p>Gerencie as informações principais da Escola Santa Albertina.</p>
          </div>
        </div>

        <div class="configuracoes-content">

          <div id="configuracoes-message" class="config-message" hidden></div>

          <form id="configuracoes-form">

            <section class="config-card">
              <div class="config-card-header">
                <div>
                  <span class="config-section-number">01</span>
                  <h2>Identidade da escola</h2>
                  <p>Informações principais apresentadas no sistema.</p>
                </div>
              </div>

              <div class="config-grid">
                <div class="config-field config-field-full">
                  <label for="schoolName">Nome da escola</label>
                  <input type="text" id="schoolName" name="schoolName"
                    placeholder="Nome da escola" required />
                </div>

                <div class="config-field config-field-full">
                  <label for="logoUrl">URL do logótipo</label>
                  <input type="url" id="logoUrl" name="logoUrl"
                    placeholder="https://..." />
                </div>

                <div class="config-field config-field-full">
                  <label for="description">Descrição</label>
                  <textarea id="description" name="description" rows="5"
                    placeholder="Descrição da escola..."></textarea>
                </div>
              </div>
            </section>

            <section class="config-card">
              <div class="config-card-header">
                <div>
                  <span class="config-section-number">02</span>
                  <h2>Contactos</h2>
                  <p>Dados utilizados para contacto com a escola.</p>
                </div>
              </div>

              <div class="config-grid">
                <div class="config-field">
                  <label for="phone">Telefone</label>
                  <input type="tel" id="phone" name="phone"
                    placeholder="+244 ..." />
                </div>

                <div class="config-field">
                  <label for="email">E-mail</label>
                  <input type="email" id="email" name="email"
                    placeholder="email@escola.ao" />
                </div>

                <div class="config-field config-field-full">
                  <label for="website">Website</label>
                  <input type="url" id="website" name="website"
                    placeholder="https://..." />
                </div>
              </div>
            </section>

            <section class="config-card">
              <div class="config-card-header">
                <div>
                  <span class="config-section-number">03</span>
                  <h2>Localização e horário</h2>
                  <p>Localização física e horário de funcionamento.</p>
                </div>
              </div>

              <div class="config-grid">
                <div class="config-field config-field-full">
                  <label for="address">Morada</label>
                  <input type="text" id="address" name="address"
                    placeholder="Morada da escola" />
                </div>

                <div class="config-field config-field-full">
                  <label for="openingHours">Horário de funcionamento</label>
                  <input type="text" id="openingHours" name="openingHours"
                    placeholder="Ex.: Segunda a Sexta: 07:00 às 17:00" />
                </div>
              </div>
            </section>

            <section class="config-card">
              <div class="config-card-header">
                <div>
                  <span class="config-section-number">04</span>
                  <h2>Redes sociais</h2>
                  <p>Perfis oficiais da Escola Santa Albertina.</p>
                </div>
              </div>

              <div class="config-grid">
                <div class="config-field">
                  <label for="facebook">Facebook</label>
                  <input type="text" id="facebook" name="facebook"
                    placeholder="Nome ou URL do perfil" />
                </div>

                <div class="config-field">
                  <label for="instagram">Instagram</label>
                  <input type="text" id="instagram" name="instagram"
                    placeholder="Nome ou URL do perfil" />
                </div>
              </div>
            </section>

            <div class="config-actions">
              <button type="submit" class="config-save-button">
                Guardar alterações
              </button>
            </div>

          </form>
        </div>
      </section>
    `;
  },

  async init() {
    const form = document.querySelector("#configuracoes-form");

    if (!form) {
      return;
    }

    const message = document.querySelector("#configuracoes-message");
    const saveButton = form.querySelector(".config-save-button");

    const showMessage = (text, type = "success") => {
      message.textContent = text;
      message.className = `config-message ${type}`;
      message.hidden = false;
    };

    const setValue = (name, value) => {
      const field = form.elements[name];

      if (field) {
        field.value = value ?? "";
      }
    };

    try {
      const response = await apiRequest("/settings/school");

      const school = response?.data;

      if (!school) {
        throw new Error("Não foram encontradas configurações da escola.");
      }

      setValue("schoolName", school.schoolName);
      setValue("logoUrl", school.logoUrl);
      setValue("description", school.description);
      setValue("phone", school.phone);
      setValue("email", school.email);
      setValue("website", school.website);
      setValue("address", school.address);
      setValue("openingHours", school.openingHours);

      let socialLinks = {};

      if (school.socialLinks) {
        try {
          socialLinks =
            typeof school.socialLinks === "string"
              ? JSON.parse(school.socialLinks)
              : school.socialLinks;
        } catch {
          socialLinks = {};
        }
      }

      setValue("facebook", socialLinks.facebook);
      setValue("instagram", socialLinks.instagram);

      form.dataset.schoolId = school.id;
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);

      showMessage(
        error.message || "Não foi possível carregar as configurações.",
        "error"
      );
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const schoolId = form.dataset.schoolId;

      if (!schoolId) {
        showMessage(
          "Não foi possível identificar a escola.",
          "error"
        );
        return;
      }

      const data = {
        schoolName: form.elements.schoolName.value.trim(),
        logoUrl: form.elements.logoUrl.value.trim() || undefined,
        description: form.elements.description.value.trim() || undefined,
        phone: form.elements.phone.value.trim() || undefined,
        email: form.elements.email.value.trim() || undefined,
        website: form.elements.website.value.trim() || undefined,
        address: form.elements.address.value.trim() || undefined,
        openingHours: form.elements.openingHours.value.trim() || undefined,
        socialLinks: JSON.stringify({
          facebook: form.elements.facebook.value.trim(),
          instagram: form.elements.instagram.value.trim()
        })
      };

      if (!data.schoolName) {
        showMessage(
          "O nome da escola é obrigatório.",
          "error"
        );
        return;
      }

      saveButton.disabled = true;
      saveButton.textContent = "A guardar...";

      try {
        await apiRequest(`/settings/school/${schoolId}`, {
          method: "PUT",
          body: data
        });

        showMessage(
          "Configurações guardadas com sucesso.",
          "success"
        );
      } catch (error) {
        console.error("Erro ao guardar configurações:", error);

        showMessage(
          error.message || "Não foi possível guardar as alterações.",
          "error"
        );
      } finally {
        saveButton.disabled = false;
        saveButton.textContent = "Guardar alterações";
      }
    });
  }
};

export default Configuracoes;
