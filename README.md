# About the Project
This BSc final year project aims to enhance the diagnostic and support capabilities of healthcare professionals in primary care centres. Its main objective is to develop a technological platform that allows primary care workers to interact with specialists in real time and remotely through the use of mixed reality. The envisaged application scenario involves a primary care doctor wearing mixed reality glasses equipped with an application that supports real-time, high-definition video calls with specialists over 5G networks, while allowing interaction with the physical environment. On the other hand, the specialist uses a desktop application to provide feedback and guidance that the GP can visualise in the three-dimensional environment displayed by the mixed reality glasses. This setup allows the specialist to see live what the primary care team is seeing, and provide verbal and visual support through hand gestures and graphical markers. A practical use case is the integration of a visual triage process to assess the severity of a patient's condition and determine if a specialist is needed. The use of 5G technology at the infrastructure level is envisaged to ensure a smooth and satisfactory user experience in real time, particularly considering the potential impact of the developed prototype in rural areas to mitigate depopulation and contribute to the commercial development of 5G technology. 

# Directory Structure
- **ar**: contains the Unity application intended to be used on the Quest 3 headset.
- **web**: contains a NextJS frontend
- **api**: contains REST API implemented in Python using FastAPI
- **llm**: contains the service which is connected to the vector database and interacts with an LLM which generates an answer to a query in natural language using the information uploaded by the user.

# Commits and Branching
- [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).
- [GIT-FLOW](https://nvie.com/posts/a-successful-git-branching-model/).