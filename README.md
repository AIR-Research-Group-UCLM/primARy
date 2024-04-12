# About the Project
This undergraduate project aims to increase the diagnostic and assistance capabilities of health
professionals in primary care centres. Its main objective is the development of a system that allows
primary care workers to follow medical protocols in a guided way through the use of mixed reality
and Artificial Intelligence. These protocols, defined by means of a node-based visual editor, can be
automatically loaded into the mixed reality application, thus extending the functional capabilities of
the system to different healthcare situations. The protocols will be enriched with documents and
multimedia material that will serve as a basis for intelligent suggestions and recommendations by
the system. This functionality will rely on a large language model deployed on its own server where
the inference process will be carried out. As a practical use case, the integration of a visual triage
process to assess the severity of a patient and act according to their medical situation is envisaged. It
is intended to scale this method of medical care so that it can be used in primary care centres, in
patients' homes or even during emergencies, by medical and nursing staff


# Directory Structure
- **ar**: contains the Unity application intended to be used on the Quest 3 headset.
- **web**: contains a NextJS frontend
- **api**: contains REST API implemented in Python using FastAPI
- **llm**: contains the service which is connected to the vector database and interacts with an LLM which generates an answer to a query in natural language using the information uploaded by the user.

# Commits and Branching
- [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).
- [GIT-FLOW](https://nvie.com/posts/a-successful-git-branching-model/).