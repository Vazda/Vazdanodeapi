import { DB } from '../config/db';

const insertProjectMembersInfo = async (projectId, userId, role) => {
    const db = DB.getInstance();
    try {
        // Add into 'project_members'
        await db.ProjectMembers.create({
            'projectId': projectId,
            'userId': userId,
            'role': role
        });

        return 'Sucessfully added project members info';
    } catch(e){
        console.log(e)
        throw (new (Error("Unable to add project members info.")));
    }
}

export default { insertProjectMembersInfo }