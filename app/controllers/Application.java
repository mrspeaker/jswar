package controllers;

import java.util.*;

import play.*;
import play.mvc.*;
import play.libs.*;

public class Application extends Controller {

    public static void index() {
        render();
    }
    
    public static void demo() {
        render();
    }
    
    public static void editor() {
        String code = Play.getVirtualFile("robots-base/editable/script.js").contentAsString();
        render(code);
    }
    
    //
    
    public static void robot(String id) throws Exception {
        // Definition
        String name = id;
        Object script = reverse();{robotScript(id);}
        
        Map description = new HashMap();
        description.put("name", name);
        description.put("script", script.toString());
        description.put("body", Images.toBase64(Play.getFile("robots-base/"+id+"/body.png")));
        description.put("turret", Images.toBase64(Play.getFile("robots-base/"+id+"/turret.png")));
        description.put("radar", Images.toBase64(Play.getFile("robots-base/"+id+"/radar.png")));
        description.put("bullet", Images.toBase64(Play.getFile("robots-base/"+id+"/bullet.png")));
        renderJSON(description);
    }
    
    public static void robotScript(String id) {
        renderBinary(Play.getFile("robots-base/"+id+"/script.js"));
    }
    
    public static void robotBaseScript() {
        renderBinary(Play.getFile("public/javascripts/robot.js"));
    }
    
    public static void saveRobotScript(String id, String body) throws Exception {
        IO.writeContent(body, Play.getFile("robots-base/"+id+"/script.js"));
        ok();
    }

}