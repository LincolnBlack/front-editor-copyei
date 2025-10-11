import React, { useState } from 'react';
import Modal, { ModalHeader, ModalBody, ModalFooter } from './bootstrap/Modal';
import Button from './bootstrap/Button';
import Card, { CardBody } from './bootstrap/Card';
import Input from './bootstrap/forms/Input';

interface Template {
	id: string;
	name: string;
	description: string;
	thumbnail: string | null;
	html: string;
}

interface TemplateModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSelectTemplate: (template: Template, pageName: string) => void;
}

const templates: Template[] = [
	{
		id: 'lpcompleta',
		name: 'Landing Page Completa',
		description: 'estrutura completa de uma landing page com seções personalizadas',
		thumbnail: 'http://localhost:3000/images/print_da_tela.png',
		html: `
  <!DOCTYPE html>
  <html lang="pt-BR">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Clínica Odontológica Premium</title>
      <link
        href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css"
        rel="stylesheet"
      />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"
      />
    </head>
    <body class="bg-white text-gray-800 font-sans">
      <!-- Header -->
      <header class="bg-blue-700 text-white">
        <div
          class="max-w-6xl mx-auto flex justify-between items-center py-4 px-6"
        >
          <div class="text-2xl font-bold">Sorriso Premium</div>
          <div class="hidden md:flex items-center space-x-6">
            <span class="text-lg">📞 (11) 99999-0000</span>
            <a
              href="#form"
              class="bg-yellow-400 hover:bg-yellow-300 text-blue-900 font-bold py-2 px-4 rounded animate__animated animate__bounce"
            >
              Agendar avaliação gratuita
            </a>
          </div>
        </div>
      </header>
  
      <!-- Hero Banner -->
      <section class="relative">
        <img
          src="https://source.unsplash.com/1600x600/?dental,smile"
          alt="Sorriso bonito"
          class="w-full h-96 object-cover"
        />
        <div
          class="absolute inset-0 bg-blue-900 bg-opacity-60 flex flex-col items-center justify-center text-white text-center px-4"
        >
          <h1
            class="text-4xl md:text-5xl font-bold mb-4 animate__animated animate__fadeInUp"
          >
            Sorrisos que transformam vidas
          </h1>
          <p
            class="text-xl mb-6 animate__animated animate__fadeInUp animate__delay-1s"
          >
            Especialistas em lentes, implantes e estética dental
          </p>
          <a
            href="#form"
            class="bg-yellow-400 hover:bg-yellow-300 text-blue-900 font-bold py-3 px-6 rounded animate__animated animate__bounce animate__delay-2s"
          >
            Agende sua avaliação gratuita
          </a>
        </div>
      </section>
  
      <!-- Especialidades -->
      <section class="max-w-6xl mx-auto py-16 px-6">
        <h2 class="text-3xl font-bold text-center mb-12">
          Nossas Especialidades
        </h2>
        <div class="grid md:grid-cols-4 gap-8 text-center">
          <div class="bg-white shadow-lg rounded-xl p-6">
            <img
              src="https://source.unsplash.com/300x200/?veneers,dental"
              alt="Lentes"
              class="w-full h-40 object-cover rounded mb-4"
            />
            <h3 class="text-xl font-semibold mb-2">Lentes de Contato Dental</h3>
            <p>Harmonia e perfeição no seu sorriso.</p>
          </div>
          <div class="bg-white shadow-lg rounded-xl p-6">
            <img
              src="https://source.unsplash.com/300x200/?implant,dentistry"
              alt="Implantes"
              class="w-full h-40 object-cover rounded mb-4"
            />
            <h3 class="text-xl font-semibold mb-2">Implantes Dentários</h3>
            <p>Segurança e conforto para mastigar e sorrir.</p>
          </div>
          <div class="bg-white shadow-lg rounded-xl p-6">
            <img
              src="https://source.unsplash.com/300x200/?teeth,whitening"
              alt="Clareamento"
              class="w-full h-40 object-cover rounded mb-4"
            />
            <h3 class="text-xl font-semibold mb-2">Clareamento Dental</h3>
            <p>Sorriso branco e radiante em poucas sessões.</p>
          </div>
          <div class="bg-white shadow-lg rounded-xl p-6">
            <img
              src="https://source.unsplash.com/300x200/?orthodontics,smile"
              alt="Ortodontia"
              class="w-full h-40 object-cover rounded mb-4"
            />
            <h3 class="text-xl font-semibold mb-2">Ortodontia</h3>
            <p>Alinhamento e estética com conforto e eficiência.</p>
          </div>
        </div>
      </section>
  
      <!-- Antes e Depois -->
      <section class="bg-gray-50 py-16 px-6">
        <div class="max-w-6xl mx-auto">
          <h2 class="text-3xl font-bold text-center mb-12">Antes e Depois</h2>
          <div class="grid md:grid-cols-2 gap-8">
            <img
              src="https://source.unsplash.com/600x400/?smile,before"
              alt="Antes"
              class="w-full h-80 object-cover rounded shadow-lg"
            />
            <img
              src="https://source.unsplash.com/600x400/?smile,after"
              alt="Depois"
              class="w-full h-80 object-cover rounded shadow-lg"
            />
          </div>
        </div>
      </section>
  
      <!-- Depoimentos -->
      <section class="max-w-6xl mx-auto py-16 px-6">
        <h2 class="text-3xl font-bold text-center mb-12">
          O que nossos pacientes dizem
        </h2>
        <div class="grid md:grid-cols-3 gap-6">
          <div class="bg-white shadow-md rounded-xl p-6 text-center">
            <p class="italic mb-4">
              "Fiz minhas lentes com a equipe e foi a melhor decisão. Atendimento
              excelente!"
            </p>
            <span class="font-semibold">– Juliana M.</span>
          </div>
          <div class="bg-white shadow-md rounded-xl p-6 text-center">
            <p class="italic mb-4">
              "Os implantes mudaram minha vida. Profissionalismo e carinho em cada
              detalhe."
            </p>
            <span class="font-semibold">– Carlos R.</span>
          </div>
          <div class="bg-white shadow-md rounded-xl p-6 text-center">
            <p class="italic mb-4">
              "Sempre tive medo de dentista, mas aqui me senti segura e acolhida."
            </p>
            <span class="font-semibold">– Fernanda L.</span>
          </div>
        </div>
      </section>
  
      <!-- Por que escolher -->
      <section class="bg-blue-50 py-16 px-6">
        <div class="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 class="text-3xl font-bold mb-6">
              Por que escolher nossa clínica?
            </h2>
            <ul class="space-y-4 text-lg">
              <li>✔ Equipe especializada e experiente</li>
              <li>✔ Atendimento humanizado</li>
              <li>✔ Estrutura moderna e confortável</li>
              <li>✔ Resultados estéticos naturais</li>
            </ul>
          </div>
          <img
            src="https://source.unsplash.com/600x400/?dentist,clinic"
            alt="Clínica"
            class="w-full h-80 object-cover rounded shadow-md"
          />
        </div>
      </section>
  
      <!-- Formulário -->
      <section id="form" class="max-w-2xl mx-auto py-16 px-6">
        <h2 class="text-3xl font-bold text-center mb-8">
          Agende sua avaliação gratuita
        </h2>
        <form class="bg-white shadow-lg rounded-xl p-8 space-y-6">
          <input
            type="text"
            placeholder="Nome completo"
            class="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
            required
          />
          <input
            type="tel"
            placeholder="Telefone / WhatsApp"
            class="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
            required
          />
          <input
            type="email"
            placeholder="E-mail"
            class="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <textarea
            placeholder="Mensagem (opcional)"
            class="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
            rows="4"
          ></textarea>
          <button
            type="submit"
            class="w-full bg-blue-700 hover:bg-blue-600 text-white font-bold py-3 rounded animate__animated animate__fadeInUp"
          >
            Enviar
          </button>
        </form>
      </section>
  
      <!-- Localização -->
      <section class="bg-gray-100 py-16 px-6">
        <div class="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 class="text-2xl font-bold mb-4">Onde estamos</h2>
            <p class="mb-2">📍 Av. Paulista, 1000 – São Paulo, SP</p>
            <p>🕒 Seg a Sex: 9h às 18h | Sáb: 9h às 14h</p>
          </div>
          <iframe
            class="w-full h-64 rounded shadow-lg"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3656.9068438472395!2d-46.65243328443414!3d-23.576518067092766!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce59c9158e0ad1%3A0xc678b7a6f8aa97f2!2sAv.%20Paulista%2C%201000%20-%20Bela%20Vista%2C%20S%C3%A3o%20Paulo%20-%20SP!5e0!3m2!1spt-BR!2sbr!4v1611614280733!5m2!1spt-BR!2sbr"
            allowfullscreen=""
            loading="lazy"
          ></iframe>
        </div>
      </section>
  
      <!-- Rodapé -->
      <footer class="bg-blue-800 text-white py-6">
        <div
          class="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center px-6 space-y-4 md:space-y-0"
        >
          <p>&copy; 2025 Sorriso Premium. Todos os direitos reservados.</p>
          <div class="space-x-4">
            <a href="#" class="hover:underline">Instagram</a>
            <a href="#" class="hover:underline">Facebook</a>
            <a href="#" class="hover:underline">WhatsApp</a>
          </div>
        </div>
      </footer>
  
      <!-- WhatsApp Floating Button -->
      <a
        href="https://wa.me/5511999990000"
        target="_blank"
        class="fixed bottom-6 right-6 bg-green-500 hover:bg-green-400 text-white rounded-full p-4 shadow-lg z-50 animate__animated animate__bounce animate__infinite"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </a>
  
      <!-- JavaScript para funcionalidades -->
      <script>
        // Aqui você pode adicionar lógica para validações, animações ou ações do formulário
      </script>
    </body>
  </html>
  
      `,
	},
	{
		id: 'startup',
		name: 'Startup Modern',
		description: 'Template moderno para startups e empresas de tecnologia',
		thumbnail: null,
		html: `
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>E-commerce</title>
          <link
            href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css"
            rel="stylesheet"
          />
        <style>
        .hero-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 100px 0;
          text-align: center;
          color: white;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        h1 { font-size: 3.5rem; font-weight: bold; margin-bottom: 20px; }
        p { font-size: 1.3rem; margin-bottom: 40px; opacity: 0.9; }
        .cta-button {
          background: #ff6b6b;
          color: white;
          padding: 18px 40px;
          border: none;
          border-radius: 50px;
          font-size: 1.2rem;
          cursor: pointer;
          transition: transform 0.3s ease;
        }
        .cta-button:hover { transform: translateY(-2px); }
        </style>
        </head>
        <body class="bg-gray-100 text-gray-800 font-sans">
        <section class="hero-section">
          <div class="container">
            <h1>Revolucione seu Negócio</h1>
            <p>Soluções inovadoras para empresas do futuro</p>
            <button class="cta-button">Começar Agora</button>
          </div>
        </section>
        </body>
      </html>
      `,
	},
	{
		id: 'saas',
		name: 'SaaS Business',
		description: 'Perfeito para produtos SaaS e serviços online',
		thumbnail: null,
		html: `
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>E-commerce</title>
          <link
            href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css"
            rel="stylesheet"
          />
        <style>
        .saas-hero {
          background: #f8fafc;
          padding: 120px 0;
          text-align: center;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        h1 { font-size: 3.2rem; font-weight: 700; margin-bottom: 20px; color: #1a202c; }
        p { font-size: 1.2rem; margin-bottom: 40px; color: #4a5568; }
        .cta-buttons { display: flex; gap: 20px; justify-content: center; flex-wrap: wrap; }
        .btn-primary, .btn-secondary {
          padding: 15px 30px;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .btn-primary {
          background: #3182ce;
          color: white;
          border: none;
        }
        .btn-secondary {
          background: transparent;
          color: #3182ce;
          border: 2px solid #3182ce;
        }
        .btn-primary:hover { background: #2c5282; }
        .btn-secondary:hover { background: #3182ce; color: white; }
        </style>
        </head>
        <body class="bg-gray-100 text-gray-800 font-sans">
        <section class="saas-hero">
          <div class="container">
            <h1>Aumente sua Produtividade</h1>
            <p>A ferramenta que sua equipe precisa para ser mais eficiente</p>
            <div class="cta-buttons">
              <button class="btn-primary">Teste Grátis</button>
              <button class="btn-secondary">Ver Demo</button>
            </div>
          </div>
        </section>
        </body>
      </html>
      `,
	},
	{
		id: 'ecommerce',
		name: 'E-commerce',
		description: 'Template otimizado para vendas online',
		thumbnail: null,
		html: `
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>E-commerce</title>
          <link
            href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css"
            rel="stylesheet"
          />
          <style>
            .ecommerce-hero {
              background: linear-gradient(45deg, #f093fb 0%, #f5576c 100%);
              padding: 100px 0;
              text-align: center;
              color: white;
            }
            .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
            h1 { font-size: 3.5rem; font-weight: bold; margin-bottom: 20px; }
            p { font-size: 1.3rem; margin-bottom: 40px; opacity: 0.95; }
            .shop-button {
              background: #fff;
              color: #f5576c;
              padding: 18px 40px;
              border: none;
              border-radius: 50px;
              font-size: 1.2rem;
              font-weight: bold;
              cursor: pointer;
              margin-bottom: 30px;
              transition: transform 0.3s ease;
            }
            .shop-button:hover { transform: scale(1.05); }
            .features {
              display: flex;
              gap: 30px;
              justify-content: center;
              flex-wrap: wrap;
            }
            .features span {
              background: rgba(255,255,255,0.2);
              padding: 10px 20px;
              border-radius: 25px;
              font-weight: 500;
            }
          </style>
        </head>
        <body class="bg-gray-100 text-gray-800 font-sans">
          <section class="ecommerce-hero">
            <div class="container">
              <h1>Produtos Exclusivos</h1>
              <p>Descubra nossa coleção premium com descontos imperdíveis</p>
              <button class="shop-button">Comprar Agora</button>
              <div class="features">
                <span>✓ Frete Grátis</span>
                <span>✓ Garantia Total</span>
                <span>✓ Entrega Rápida</span>
              </div>
            </div>
          </section>
        </body>
      </html>`,
	},
];

const TemplateModal: React.FC<TemplateModalProps> = ({ isOpen, onClose, onSelectTemplate }) => {
	const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
	const [pageName, setPageName] = useState<string>('');
	const [isCreating, setIsCreating] = useState<boolean>(false);

	const handleTemplateSelect = (template: Template) => {
		setSelectedTemplate(template);
		setPageName(template.name); // Pré-preenche com o nome do template
	};

	const handleCreatePage = async () => {
		if (!selectedTemplate || !pageName.trim()) {
			alert('Por favor, preencha o nome da página.');
			return;
		}

		setIsCreating(true);
		try {
			await onSelectTemplate(selectedTemplate, pageName.trim());
			handleClose();
		} catch (error) {
			console.error('Erro ao criar página:', error);
			alert('Erro ao criar página. Tente novamente.');
		} finally {
			setIsCreating(false);
		}
	};

	const handleClose = () => {
		setSelectedTemplate(null);
		setPageName('');
		setIsCreating(false);
		onClose();
	};

	return (
		<Modal isOpen={isOpen} setIsOpen={handleClose} size='xl' titleId='template-modal'>
			<ModalHeader>
				<h5 className='modal-title'>Escolher Template</h5>
			</ModalHeader>
			<ModalBody>
				{!selectedTemplate ? (
					<div className='template-grid'>
						{templates.map((template) => (
							<div key={template.id} className='template-item'>
								<Card
									className='template-card h-100 cursor-pointer'
									onClick={() => handleTemplateSelect(template)}>
									<CardBody className='p-0'>
										{template.thumbnail ? (
											<div className='template-preview'>
												<div className='template-image-container'>
													<img
														src={template.thumbnail}
														alt={template.name}
														className='template-thumbnail'
													/>
												</div>
											</div>
										) : (
											<div className='template-placeholder'>
												<i className='fas fa-image' />
												<p>Sem preview disponível</p>
											</div>
										)}
										<div className='template-info p-3'>
											<h6 className='template-title'>{template.name}</h6>
											<p className='template-description'>
												{template.description}
											</p>
											<div className='template-badge'>
												<i className='fas fa-star' />
												<span>Premium</span>
											</div>
										</div>
									</CardBody>
								</Card>
							</div>
						))}
					</div>
				) : (
					<div className='template-selection p-3'>
						<div className='d-flex align-items-center mb-4'>
							<Button
								color='link'
								onClick={() => setSelectedTemplate(null)}
								className='me-3'>
								<i className='fas fa-arrow-left' /> Voltar
							</Button>
							<h5 className='mb-0'>
								Criar página a partir de: {selectedTemplate.name}
							</h5>
						</div>

						{selectedTemplate.thumbnail && (
							<div className='mb-4'>
								<div className='selected-template-preview'>
									<div className='selected-template-image-container'>
										<img
											src={selectedTemplate.thumbnail}
											alt={selectedTemplate.name}
											className='selected-template-thumbnail'
										/>
									</div>
								</div>
							</div>
						)}

						<div className='mb-3'>
							<label htmlFor='page-name' className='form-label'>
								Nome da página
							</label>
							<Input
								id='page-name'
								type='text'
								placeholder='Digite o nome da página'
								value={pageName}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									setPageName(e.target.value)
								}
							/>
						</div>

						<div className='alert alert-info'>
							<p className='mb-0'>
								<strong>Descrição:</strong> {selectedTemplate.description}
							</p>
						</div>
					</div>
				)}
			</ModalBody>
			<ModalFooter>
				<Button color='link' onClick={handleClose} isDisable={isCreating}>
					Cancelar
				</Button>
				{selectedTemplate && (
					<Button
						color='primary'
						onClick={handleCreatePage}
						isDisable={isCreating || !pageName.trim()}>
						{isCreating ? (
							<>
								<span
									className='spinner-border spinner-border-sm me-2'
									role='status'
								/>
								Criando...
							</>
						) : (
							'Criar Página'
						)}
					</Button>
				)}
			</ModalFooter>
		</Modal>
	);
};

export default TemplateModal;
