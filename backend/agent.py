import logging
import os
from dotenv import load_dotenv

from livekit import agents, rtc
from livekit.agents import AgentServer, AgentSession, Agent, room_io
from livekit.plugins import (
    google,
    noise_cancellation,
    silero,
    bey
)

from prompts import AGENT_INSTRUCTIONS
from tools import complete_interview

# Load environment variables
load_dotenv(".env.local")

logger = logging.getLogger("mock-interview-agent")
logger.setLevel(logging.INFO)

class Assistant(Agent):
    def __init__(self) -> None:
        super().__init__(
            instructions=AGENT_INSTRUCTIONS, 
            tools=[complete_interview]
        )

server = AgentServer()

@server.rtc_session()
async def mock_interview_agent(ctx: agents.JobContext):
    logger.info(f"Connecting to room {ctx.room.name}")
    
    session = AgentSession(
        llm=google.realtime.RealtimeModel(
            voice="Puck",
        ),
        # STT is disabled to avoid Service Account JSON requirement. 
        # The RealtimeModel will handle voice interaction.
        vad=silero.VAD.load(),
    )

    # Beyond Presence Avatar integration
    avatar = bey.AvatarSession(
        avatar_id=os.getenv("BEY_AVATAR_ID"), # Set this in your .env.local
    )

    # Start the avatar session
    await avatar.start(session, room=ctx.room)

    # Start the agent session with video_input=True
    await session.start(
        room=ctx.room,
        agent=Assistant(),
        room_options=room_io.RoomOptions(
            audio_input=room_io.AudioInputOptions(
                noise_cancellation=lambda params: noise_cancellation.BVCTelephony() 
                    if params.participant.kind == rtc.ParticipantKind.PARTICIPANT_KIND_SIP 
                    else noise_cancellation.BVC(),
            ),
            video_input=True
        ),
    )

    # Initial greeting to start the interview
    await session.generate_reply(
        instructions="Greet the interviewee warmly, introduce yourself as their AI Mock Interviewer, and ask them to start by introducing themselves."
    )

if __name__ == "__main__":
    agents.cli.run_app(server)
