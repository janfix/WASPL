<template>
  <div class="main">
    <div class="container-fluid">
      <div class="row">
        <!-- Sidebar -->
        <nav class="col-md-2 bg-light vh-100 sticky-top p-3">
          <h2>Sommaire</h2>
          <ul class="nav flex-column">
            <li class="nav-item">
              <a class="nav-link active" href="#introduction">Introduction</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#gettingStarted">Getting Started</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#installation">Installation</a>
            </li>


            <li class="nav-item">
              <a class="nav-link" href="#features">Features</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#technologies">Technologies utilisées</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#objectives">Objectifs</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#license">License</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#about">About</a>
            </li>
          </ul>
        </nav>
  
        <!-- Content -->
        <div class="col-md-10 p-4">
          <section id="introduction">
            <h1>Introduction</h1>
            <p>
              WASPL est une application modulaire et évolutive centrée sur la création, l'édition, et l'évaluation de tests numériques dynamiques...
            </p>
          </section>
  
        <section id="gettingStarted">
            <h2>Getting Started</h2>
                <h3>Installation</h3>
            <ol>
            <li>Github</li>
            </ol>
        </section>   

          <section id="features">
            <h2>Features</h2>
            <ol>
        <li>
            <strong>Création et édition d'interactions</strong>
            <ul>
                <li><strong>Éditeur interactif :</strong> Utilise Vue 3 et des outils comme Quill pour concevoir des questions, incluant des interactions comme choix multiples, appariements, ordre, texte à trous, etc.</li>
                <li><strong>Visualisation en temps réel :</strong> Les utilisateurs peuvent prévisualiser les interactions et les questions directement dans l'application.</li>
            </ul>
        </li>
        <li>
            <strong>Gestion des tests</strong>
            <ul>
                <li><strong>Banque d’items :</strong> Organisation des questions et interactions dans une structure hiérarchique modifiable.</li>
                <li><strong>CRUD (Create, Read, Update, Delete) :</strong> Manipulation aisée des tests et de leurs composants via une interface utilisateur claire.</li>
            </ul>
        </li>
        <li>
            <strong>Rapports de performance</strong>
            <ul>
                <li><strong>Formats multiples :</strong> Rapports pour élèves, enseignants, et analyses statistiques.</li>
                <li><strong>Options analytiques :</strong> Résultats bruts, profils, classements, et psychométrie.</li>
            </ul>
        </li>
        <li>
            <strong>Interopérabilité</strong>
            <ul>
                <li><strong>Conversion de formats :</strong> Support pour la transformation de formats standards comme QTI 2.2 vers un format JSON personnalisé.</li>
                <li><strong>Stockage MongoDB :</strong> Gestion centralisée des données (tests, interactions, performances).</li>
            </ul>
        </li>
        <li>
            <strong>Documentation intégrée</strong>
            <ul>
                <li><strong>Composant Wiki :</strong> Fournit un espace dédié à la documentation de l’application et des guides utilisateurs.</li>
            </ul>
        </li>
        <li>
            <strong>Sécurité et personnalisation</strong>
            <ul>
                <li><strong>Authentification JWT :</strong> Accès sécurisé pour les utilisateurs.</li>
                <li><strong>Personnalisation avancée :</strong> Interface utilisateur adaptable et intégration de plugins.</li>
            </ul>
        </li>
    </ol>
          </section>
  
          <section id="technologies">
            <h2>Technologies utilisées</h2>
            <ul>
              <li><strong>Frontend :</strong> Vue 3, Vite, Pinia, BootstrapVueNext.</li>
              <li><strong>Backend :</strong> Node.js, Express.</li>
              <li><strong>Base de données :</strong> MongoDB.</li>
            </ul>
          </section>
  
          <section id="objectives">
            <h2>Objectifs</h2>
            <ul>
              <li>Offrir une plateforme flexible pour créer et évaluer des tests éducatifs.</li>
              <li>Faciliter la documentation et la gestion des performances des élèves.</li>
              <li>Permettre une montée en puissance progressive grâce à son architecture modulaire.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  </div>
  </template>
  
  <style>
  /* Add some padding to the content */
  body {
    scroll-behavior: smooth; /* Smooth scrolling to anchors */
  }
  
  .sticky-top {
    top: 0;
  }
  
  .nav-link.active {
    font-weight: bold;
    color: #007bff;
  }

  .main {
    background-color: #F8F9FA;
    padding: 30px;
    border-left: 1px gainsboro solid;
  }

  </style>
  