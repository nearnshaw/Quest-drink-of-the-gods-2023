<p align="center">
  <a href="https://decentraland.org">
    <img alt="Decentraland" src="https://decentraland.org/images/logo.png" width="60" />
  </a>
</p>
<h1 align="center">
  Quest: The Drink of the Gods
</h1>

This is a Decentraland Scene example using SDK7 and the [Quests Client](https://github.com/decentraland/quests-client 'Quests Client repository') where you can see how it's used to show some information about the current Quests or to send events based on what's happening on the Explorer session.

## Start

Use preview mode to test the feature:

```console
$ npm run start
```

## Quests Client in action

In this example you will see:

- **Quests Client creation**: user is authenticated based on the signed headers provided by the SDK7

- **Quests tracking UI**:
  - Simple Quest Tracker UI that shows current state for each active Quest
  - Listen to Quest events to update the UI
- **Quests Progress**:
  - Systems reading the World state
  - Send updates to the quest server when the player progresses in one of the actions of the quest

**Note**: _Quests client_ will check if the event to send applies to any active quest before sending it to the server.

## Quest Definition

```json
{
  "name": "The drink of the gods",
  "description": "Collect all the ingredients to make the perfect drink",
  "imageUrl": "https://github.com/decentraland-scenes/Awesome-Repository/blob/master/screenshots/genesis.jpg",
  "definition": {
    "steps": [
      {
        "id": "talk_octo_1_step",
        "description": "Talk to the Octopus",
        "tasks": [
          {
            "id": "talk_octo_1_task",
            "description": "Talk to the Octopus Barman",
            "actionItems": [
              {
                "type": "CUSTOM",
                "parameters": { "id": "talk_octo_1_action" }
              }
            ]
          }
        ]
      },
      {
        "id": "collect_herbs",
        "description": "Collect herbs",
        "tasks": [
          {
            "id": "collect_vines",
            "description": "Collect 3 vine plants",
            "actionItems": [
              {
                "type": "CUSTOM",
                "parameters": { "id": "collect_vine_action" }
              },
              {
                "type": "CUSTOM",
                "parameters": { "id": "collect_vine_action" }
              },
              {
                "type": "CUSTOM",
                "parameters": { "id": "collect_vine_action" }
              }
            ]
          },
          {
            "id": "collect_berries",
            "description": "Collect from 3 berry plants",
            "actionItems": [
              {
                "type": "CUSTOM",
                "parameters": { "id": "collect_berry_action" }
              },
              {
                "type": "CUSTOM",
                "parameters": { "id": "collect_berry_action" }
              },
              {
                "type": "CUSTOM",
                "parameters": { "id": "collect_berry_action" }
              }
            ]
          },
          {
            "id": "collect_kimkim",
            "description": "Collect 3 kimkim plants",
            "actionItems": [
              {
                "type": "CUSTOM",
                "parameters": { "id": "collect_kimkim_action" }
              },
              {
                "type": "CUSTOM",
                "parameters": { "id": "collect_kimkim_action" }
              },
              {
                "type": "CUSTOM",
                "parameters": { "id": "collect_kimkim_action" }
              }
            ]
          }
        ]
      },
      {
        "id": "catGuy_step",
        "description": "Talk to cat Guy",
        "tasks": [
          {
            "id": "catGuy_task",
            "description": "Talk to the cat guy",
            "actionItems": [
              {
                "type": "CUSTOM",
                "parameters": { "id": "talk_catguy_action" }
              }
            ]
          },
          {
            "id": "get_hair_task",
            "description": "Pinch hair from cat",
            "actionItems": [
              {
                "type": "CUSTOM",
                "parameters": { "id": "get_hair_action" }
              }
            ]
          }
        ]
      },
      {
        "id": "calis_step",
        "description": "Find the golden Chalice",
        "tasks": [
          {
            "id": "calis_task",
            "description": "Find a golden Chalice",
            "actionItems": [
              {
                "type": "CUSTOM",
                "parameters": { "id": "calis_action" }
              }
            ]
          }
        ]
      },
      {
        "id": "talk_octo_2_step",
        "description": "Talk to the Octopus Barman",
        "tasks": [
          {
            "id": "talk_octo_2_task",
            "description": "Bring the cat haris to the Octopus",
            "actionItems": [
              {
                "type": "CUSTOM",
                "parameters": { "id": "talk_octo_2_action" }
              }
            ]
          }
        ]
      },
      {
        "id": "talk_octo_3_step",
        "description": "Talk to the Octopus",
        "tasks": [
          {
            "id": "talk_octo_3_task",
            "description": "Bring the herbs to the Octopus",
            "actionItems": [
              {
                "type": "CUSTOM",
                "parameters": { "id": "talk_octo_3_action" }
              }
            ]
          }
        ]
      },
      {
        "id": "talk_octo_4_step",
        "description": "Talk to the Octopus",
        "tasks": [
          {
            "id": "talk_octo_4_task",
            "description": "Bring the Chalice to the Octopus",
            "actionItems": [
              {
                "type": "CUSTOM",
                "parameters": { "id": "talk_octo_4_action" }
              }
            ]
          }
        ]
      }
    ],
    "connections": [
      {
        "stepFrom": "talk_octo_1_step",
        "stepTo": "catGuy_step"
      },
      {
        "stepFrom": "catGuy_step",
        "stepTo": "talk_octo_2_step"
      },
      {
        "stepFrom": "talk_octo_2_step",
        "stepTo": "collect_herbs"
      },
      {
        "stepFrom": "collect_herbs",
        "stepTo": "talk_octo_3_step"
      },
      {
        "stepFrom": "talk_octo_3_step",
        "stepTo": "calis_step"
      },
      {
        "stepFrom": "calis_step",
        "stepTo": "talk_octo_4_step"
      }
    ]
  }
}
```
