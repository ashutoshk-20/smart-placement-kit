from livekit.agents import llm, RunContext
import json
import logging

logger = logging.getLogger("mock-interview-tools")

@llm.function_tool
async def complete_interview(ctx: RunContext):
    """
    Call this tool when the interview is fully complete and you have given the closing statement. 
    This will trigger the final feedback generation and wrap up the session.
    """
    logger.info("Agent called complete_interview tool")
    
    # Get the room from the running context's session
    room = ctx.session.room
    
    if room:
        payload = json.dumps({"type": "INTERVIEW_COMPLETE", "reason": "agent_triggered"})
        try:
            await room.local_participant.publish_data(payload)
            return "Interview completion signal sent successfully. The session will now wrap up."
        except Exception as e:
            logger.error(f"Failed to publish data: {e}")
            return f"Failed to send completion signal: {e}"
    
    return "Error: Room session not found."
